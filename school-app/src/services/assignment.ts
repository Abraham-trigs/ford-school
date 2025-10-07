// services/assignment.ts
import { prisma } from "@/lib/prisma/prisma";
import { redis } from "@/lib/redis";
import { Prisma } from "@prisma/client";

/**
 * Tag set name helper:
 * tagSetKey('course:12') -> 'tag:assignments:course:12'
 */
const tagSetKey = (tag: string) => `tag:assignments:${tag}`;

type Requester = { userId: number; roles: string[] };

/* ----------------------------
   Redis tag helpers (atomic)
   - addCacheTags(key, ['course:12','school:5'])
   - invalidateByTags(['course:12','school:5'])
   ---------------------------- */
async function addCacheTags(key: string, tags: string[]) {
  try {
    const ops = tags.map((t) => redis.sadd(tagSetKey(t), key));
    await Promise.all(ops);
  } catch (e) {
    console.warn("addCacheTags failed", e);
  }
}

const invalidateScript = `
  -- ARGV contains the tag keys (full tag set keys)
  local allDeleted = {}
  for i = 1, #ARGV do
    local setKey = ARGV[i]
    local members = redis.call('SMEMBERS', setKey)
    if #members > 0 then
      redis.call('DEL', unpack(members))
    end
    redis.call('DEL', setKey)
  end
  return 1
`;

async function invalidateByTags(tags: string[]) {
  try {
    const tagKeys = tags.map((t) => tagSetKey(t));
    // try atomic EVAL first
    try {
      await redis.eval(invalidateScript, tagKeys);
      return;
    } catch (e) {
      // fallback (non-atomic) -> fetch SMEMBERS + DEL
      for (const k of tagKeys) {
        try {
          const keys = await redis.smembers<string>(k);
          if (keys?.length) await redis.del(...keys);
          await redis.del(k);
        } catch (inner) {
          console.warn("invalidateByTags fallback failed for", k, inner);
        }
      }
    }
  } catch (e) {
    console.warn("invalidateByTags overall failure", e);
  }
}

/* ----------------------------
   stableKey -> deterministic cache key includes pagination
   ---------------------------- */
function stableKey(filters: Record<string, any>, page: number, pageSize: number) {
  const entries = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);
  entries.sort(([a], [b]) => a.localeCompare(b));
  const qs = entries.map(([k, v]) => `${k}=${v}`).join("&") || "all";
  return `assignments:${qs}:page=${page}:size=${pageSize}`;
}

/* ----------------------------
   include payload (rich)
   ---------------------------- */
const includePayload = {
  course: true,
  teacher: true,
  students: true,
  grades: { include: { student: true } },
};

/* ----------------------------
   Authorization helper (accurate)
   ---------------------------- */
async function canManageCourse(requester: Requester, courseId: number) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, teacherId: true, schoolSessionId: true },
  });
  if (!course) return { ok: false, course: null };

  if (requester.roles.includes("SUPERADMIN")) return { ok: true, course };
  if (requester.roles.includes("ADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: { userId: requester.userId, schoolSessionId: course.schoolSessionId, active: true },
      select: { id: true },
    });
    return { ok: !!membership, course };
  }
  if (requester.roles.includes("TEACHER")) {
    return { ok: course.teacherId === requester.userId, course };
  }
  return { ok: false, course };
}

/* ----------------------------
   getAssignments (service)
   - does DB fetch and caches with tags
   ---------------------------- */
export async function getAssignments(args: {
  filters: { courseId?: number; type?: string; dueDateFrom?: string; dueDateTo?: string };
  page: number;
  pageSize: number;
  requester: Requester;
  cacheKey: string; // route already computed and gave it for consistency
}) {
  const { filters, page, pageSize, requester, cacheKey } = args;

  // build where (soft-delete + filters)
  const where: Prisma.AssignmentWhereInput = { deletedAt: null };
  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.type) where.type = filters.type as any;
  if (filters.dueDateFrom || filters.dueDateTo) {
    where.dueDate = {};
    if (filters.dueDateFrom) where.dueDate!.gte = new Date(filters.dueDateFrom);
    if (filters.dueDateTo) where.dueDate!.lte = new Date(filters.dueDateTo);
  }

  // enforce role scoping: SUPERADMIN sees all; ADMIN -> schoolSession(s); TEACHER -> teacher's courses
  if (!requester.roles.includes("SUPERADMIN")) {
    if (requester.roles.includes("ADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId: requester.userId, active: true },
        select: { schoolSessionId: true },
      });
      const ids = memberships.map((m) => m.schoolSessionId);
      if (!where.course) where.course = {};
      (where.course as any).schoolSessionId = { in: ids };
    } else if (requester.roles.includes("TEACHER")) {
      if (!where.course) where.course = {};
      (where.course as any).teacherId = requester.userId;
    }
  }

  // fetch & count in transaction
  const [items, total] = await prisma.$transaction([
    prisma.assignment.findMany({
      where,
      include: includePayload,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.assignment.count({ where }),
  ]);

  const result = {
    data: items,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };

  // cache + tag by course & school
  try {
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 });

    const courseIds = Array.from(new Set(items.map((i) => i.courseId)));
    const tags = ["all"];
    if (courseIds.length) tags.push(...courseIds.map((id) => `course:${id}`));
    const cs = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { schoolSessionId: true },
    });
    cs.forEach((c) => tags.push(`school:${c.schoolSessionId}`));

    await addCacheTags(cacheKey, tags);
  } catch (e) {
    console.warn("cache store failed", e);
  }

  return result;
}

/* ----------------------------
   createAssignment
   - validates course ownership for TEACHER, and admin membership for ADMIN
   - invalidates only relevant tags atomically
   ---------------------------- */
export async function createAssignment(args: {
  data: { courseId: number; title: string; description?: string; type?: string; dueDate?: string; metadata?: any };
  requester: Requester;
}) {
  const { data, requester } = args;
  const { ok, course } = await canManageCourse(requester, data.courseId);
  if (!course) throw { status: 404, message: "Course not found" };
  if (!ok) throw { status: 403, message: "Forbidden" };

  // teacher must be the authenticated teacher (we set teacherId from requester when TEACHER)
  const created = await prisma.assignment.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      description: data.description ?? null,
      type: data.type ? (data.type as any) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      metadata: data.metadata ?? {},
      teacherId: requester.roles.includes("TEACHER") ? requester.userId : null,
    },
    include: includePayload,
  });

  // invalidate tags: course + school + all
  const tags = [`course:${data.courseId}`, `school:${course.schoolSessionId}`, `all`];
  await invalidateByTags(tags);

  return created;
}

/* ----------------------------
   updateAssignment
   - prevents resurrecting deleted items
   - ensures RBAC
   ---------------------------- */
export async function updateAssignment(args: {
  data: { id: number; title?: string; description?: string; type?: string; dueDate?: string; metadata?: any };
  requester: Requester;
}) {
  const { data, requester } = args;
  const existing = await prisma.assignment.findUnique({
    where: { id: data.id },
    include: { course: true },
  });
  if (!existing || existing.deletedAt) throw { status: 404, message: "Not found" };

  const { ok } = await canManageCourse(requester, existing.courseId);
  if (!ok) throw { status: 403, message: "Forbidden" };

  const updated = await prisma.assignment.update({
    where: { id: data.id },
    data: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      type: data.type ? (data.type as any) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      metadata: data.metadata ?? undefined,
    },
    include: includePayload,
  });

  const tags = [`course:${existing.courseId}`, `school:${existing.course?.schoolSessionId}`, `all`].filter(Boolean) as string[];
  await invalidateByTags(tags);

  return updated;
}

/* ----------------------------
   deleteAssignment (soft) + grade soft-delete
   ---------------------------- */
export async function deleteAssignment(args: { id: number; requester: Requester }) {
  const { id, requester } = args;
  const existing = await prisma.assignment.findUnique({ where: { id }, include: { course: true } });
  if (!existing) throw { status: 404, message: "Not found" };

  const { ok } = await canManageCourse(requester, existing.courseId);
  if (!ok) throw { status: 403, message: "Forbidden" };

  const deleted = await prisma.assignment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // soft-delete related grades
  await prisma.grade.updateMany({
    where: { assignmentId: id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  const tags = [`course:${existing.courseId}`, `school:${existing.course?.schoolSessionId}`, `all`].filter(Boolean) as string[];
  await invalidateByTags(tags);

  return { id: deleted.id, courseId: existing.courseId };
}
