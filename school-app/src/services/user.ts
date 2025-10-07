// /lib/services/userService.ts
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { cacheGet, cacheSet, stableKeyFromFilters, addTagsForKey, invalidateTags } from "@/lib/utils/cacheService";
import { ApiError } from "@/lib/utils/error";
import { Prisma } from "@prisma/client";
import { rateLimiter } from "@/lib/ratelimit";

/* -------------------------
   Schemas
   ------------------------- */
export const querySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(20),
});

const createSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  profilePicture: z.string().optional(),
  role: z.string(),
  schoolSessionId: z.number().optional(),
  profileData: z.record(z.any()).optional(),
});

/* -------------------------
   Types
   ------------------------- */
type Requester = { userId: number; roles: string[] };
type GetUsersArgs = { requester: Requester; query: z.infer<typeof querySchema> };
type CreateUserArgs = { requester: Requester; data: z.infer<typeof createSchema> };

/* -------------------------
   Helper: include builder
   ------------------------- */
function buildIncludeForRole(role?: string): Prisma.UserInclude {
  const base: Prisma.UserInclude = {
    memberships: { include: { schoolSession: true } },
    superAdminMeta: true,
  };

  if (!role) return { ...base, staffProfile: true };
  if (role === "STUDENT") return { ...base, studentProfile: true };
  if (role === "PARENT") return { ...base, parentProfile: true };
  if (["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"].includes(role)) return { ...base, teacherProfile: true };
  if (role === "SUPERADMIN") return { ...base, superAdminMeta: true };
  return { ...base, staffProfile: true };
}

/* -------------------------
   Service
   ------------------------- */
export const userService = {
  async getUsers({ requester, query }: GetUsersArgs) {
    const { search, role, page, pageSize } = query;

    // stable key uses logically relevant filters (no requester-specific suffix)
    const cacheFilters = { search: search ?? undefined, role: role ?? undefined, page, pageSize };
    const cacheKey = `users:${stableKeyFromFilters(cacheFilters)}`;

    // attempt cache read
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    // protect DB with per-user read limit
    const rl = await rateLimiter.limit(String(requester.userId));
    if (!rl.success) throw new ApiError(429, "Too many requests");

    // Build typed where/include
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (search) where.OR = [{ fullName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];

    if (!requester.roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId: requester.userId, active: true }, select: { schoolSessionId: true }
      });
      const allowed = memberships.map(m => m.schoolSessionId);
      if (allowed.length === 0) return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
      where.memberships = { some: { schoolSessionId: { in: allowed }, active: true, ...(role ? { role } : {}) } };
    } else if (role) {
      where.memberships = { some: { role } };
    }

    const include = buildIncludeForRole(role);

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where, include,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const result = { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };

    // Store cache and tag it
    await cacheSet(cacheKey, result, 60 * 2);

    // tags: global + role + per-school (derived from rows)
    const tags = ["users:all"];
    if (role) tags.push(`users:role:${role}`);
    const schoolIds = new Set<number>();
    for (const u of data) {
      const ms = (u as any).memberships as any[];
      if (ms?.length) ms.forEach(m => m.schoolSessionId && schoolIds.add(m.schoolSessionId));
    }
    for (const id of Array.from(schoolIds)) tags.push(`users:school:${id}`);
    await addTagsForKey(cacheKey, tags);

    return result;
  },

  async createUser({ requester, data }: CreateUserArgs) {
    // parse (defense-in-depth) - route already validated
    const parsed = createSchema.parse(data);
    const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = parsed;

    // defense: ADMIN cannot create SUPERADMIN
    if (!requester.roles.includes("SUPERADMIN") && role === "SUPERADMIN") {
      throw new ApiError(403, "Only SUPERADMIN can create SUPERADMIN accounts");
    }

    // roles with school require schoolSessionId
    const rolesWithSchool = [
      "ADMIN","PRINCIPAL","VICE_PRINCIPAL","TEACHER","ASSISTANT_TEACHER",
      "COUNSELOR","LIBRARIAN","EXAM_OFFICER","FINANCE","HR","RECEPTIONIST",
      "IT_SUPPORT","TRANSPORT","NURSE","COOK","CLEANER","SECURITY","MAINTENANCE",
      "STUDENT","CLASS_REP","PARENT",
    ];
    if (rolesWithSchool.includes(role) && !schoolSessionId) {
      throw new ApiError(400, "schoolSessionId required for this role");
    }

    // requester must be active on the target school session (if not SUPERADMIN)
    if (!requester.roles.includes("SUPERADMIN") && rolesWithSchool.includes(role)) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: requester.userId, schoolSessionId, active: true }, select: { id: true }
      });
      if (!membership) throw new ApiError(403, "No permission for this school session");
    }

    const hashed = await bcrypt.hash(password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, fullName, profilePicture } });

      if (rolesWithSchool.includes(role)) {
        await tx.userSchoolSession.create({
          data: {
            userId: user.id,
            email,
            password: hashed,
            role,
            schoolSessionId,
            active: true,
            humanId: `${schoolSessionId}-${email.split("@")[0]}`,
          },
        });
      }

      // Explicit typed profile creation
      if (role === "SUPERADMIN") {
        await tx.superAdmin.create({ data: { userId: user.id, metadata: profileData || {} } });
      } else if (role === "STUDENT" && profileData) {
        await tx.studentProfile.create({ data: { ...profileData, userId: user.id } });
      } else if (role === "PARENT" && profileData) {
        await tx.parentProfile.create({ data: { ...profileData, userId: user.id } });
      } else if (["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"].includes(role) && profileData) {
        await tx.teacherProfile.create({ data: { ...profileData, userId: user.id } });
      } else if (["FINANCE","HR","RECEPTIONIST","IT_SUPPORT","TRANSPORT","NURSE","COOK","CLEANER","SECURITY","MAINTENANCE"].includes(role) && profileData) {
        await tx.staffProfile.create({ data: { ...profileData, userId: user.id } });
      }

      return user;
    });

    // Invalidate tags: global + role + school
    const tags = ["users:all", `users:role:${role}`];
    if (schoolSessionId) tags.push(`users:school:${schoolSessionId}`);
    try {
      await invalidateTags(tags);
    } catch (e) {
      console.warn("invalidateTags failed in createUser", e);
      // fallback coarse invalidation
      try {
        const keys = await redis.keys("users:*");
        if (keys?.length) await redis.del(...keys);
      } catch (inner) {
        console.warn("fallback coarse invalidation failed", inner);
      }
    }

    return prisma.user.findUnique({
      where: { id: created.id },
      include: buildIncludeForRole(role),
    });
  },
};

/* small helper for includes */
function buildIncludeForRole(role?: string): Prisma.UserInclude {
  const base: Prisma.UserInclude = {
    memberships: { include: { schoolSession: true } },
    superAdminMeta: true,
  };
  if (!role) return { ...base, staffProfile: true };
  if (role === "STUDENT") return { ...base, studentProfile: true };
  if (role === "PARENT") return { ...base, parentProfile: true };
  if (["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"].includes(role)) return { ...base, teacherProfile: true };
  if (role === "SUPERADMIN") return { ...base, superAdminMeta: true };
  return { ...base, staffProfile: true };
}
