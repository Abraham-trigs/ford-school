import { prisma } from "@/lib/prisma/prisma";
import { redis } from "@/lib/redis";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

const ALLOWED_ROLES = ["SUPERADMIN", "ADMIN"];
const CACHE_TAG = "schools";

// Zod schemas
const dateSchema = z.coerce.date().optional();

export const createSchoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
});

export const updateSchoolSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
});

// Redis cache key sets
const LIST_KEYS_SET = "schools:list:keys";

// Atomic Redis Lua script to delete tracked list keys
const INVAL_SCRIPT = `
  local keys = redis.call('SMEMBERS', KEYS[1])
  if #keys > 0 then redis.call('DEL', unpack(keys)) end
  redis.call('DEL', KEYS[1])
  return keys
`;

// Helper to generate stable list cache keys for given IDs
function stableAllowedKey(ids: number[] | "all") {
  if (ids === "all") return "all";
  return ids.slice().sort((a, b) => a - b).join(",");
}

function cacheKey(key: string) {
  return `schools:${key}`;
}

export const schoolService = {
  /** ---------- List Schools ---------- */
  async getSchools(user: { id: number; roles: string[] }, page = 1, pageSize = 20) {
    let allowedIds: number[] | "all" = "all";

    // Only SUPERADMIN can see all schools
    if (!user.roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId: user.id, active: true },
        select: { schoolSessionId: true },
      });
      allowedIds = memberships.map((m) => m.schoolSessionId).sort((a, b) => a - b);

      if (allowedIds.length === 0)
        return { success: true, data: [], status: 200 };
    }

    const keyPart = stableAllowedKey(allowedIds);
    const listCacheKey = cacheKey(`list:${keyPart}:${page}:${pageSize}`);
    const cached = await redis.get(listCacheKey);
    if (cached) return { success: true, data: JSON.parse(cached), status: 200 };

    const where: any = {};
    if (allowedIds !== "all") where.id = { in: allowedIds };

    const [schools, total] = await prisma.$transaction([
      prisma.schoolSession.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.schoolSession.count({ where }),
    ]);

    const resp = { data: schools, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };

    await redis.set(listCacheKey, JSON.stringify(resp), { EX: 60 * 5 });
    await redis.sadd(LIST_KEYS_SET, listCacheKey);

    return { success: true, data: resp, status: 200 };
  },

  /** ---------- Get Single School ---------- */
  async getSchool(user: { id: number; roles: string[] }, id: string) {
    const schoolId = Number(id);
    if (Number.isNaN(schoolId)) throw new NotFoundError("Invalid school ID");

    // Only check membership if not SUPERADMIN
    if (!user.roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: user.id, schoolSessionId: schoolId, active: true },
      });
      if (!membership) throw new ForbiddenError("Access denied");
    }

    // Fetch school from DB (only active)
    const school = await prisma.schoolSession.findFirst({
      where: { id: schoolId, deletedAt: null },
    });
    if (!school) throw new NotFoundError("School not found");

    return { success: true, data: school, status: 200 };
  },

  /** ---------- Create School ---------- */
  async createSchool(user: { id: number; roles: string[] }, data: unknown) {
    if (!user.roles.some((r) => ALLOWED_ROLES.includes(r))) throw new ForbiddenError("Insufficient permissions");

    const parsed = createSchoolSchema.parse(data);
    const newSchool = await prisma.schoolSession.create({ data: parsed });

    // Cache invalidation: delete list keys and new item's cache key
    const itemKey = cacheKey(`item:${newSchool.id}`);
    try {
      await redis.eval(INVAL_SCRIPT, [LIST_KEYS_SET]);
      await redis.del(itemKey);
    } catch {
      // fallback: best-effort deletion
      await Promise.all([
        redis.del(itemKey),
        redis.delPattern("schools:list:*"),
        redis.del(LIST_KEYS_SET),
      ]);
    }
    revalidateTag(CACHE_TAG);

    return { success: true, data: newSchool, status: 201 };
  },

  /** ---------- Update School ---------- */
  async updateSchool(user: { id: number; roles: string[] }, id: string, data: unknown) {
    const schoolId = Number(id);
    if (Number.isNaN(schoolId)) throw new NotFoundError("Invalid school ID");

    // Only SUPERADMIN or member ADMIN can update
    const existing = await prisma.schoolSession.findFirst({ where: { id: schoolId, deletedAt: null } });
    if (!existing) throw new NotFoundError("School not found");

    if (!user.roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: user.id, schoolSessionId: schoolId, active: true },
      });
      if (!membership) throw new ForbiddenError("Not a member of this school");
    }

    const parsed = updateSchoolSchema.parse(data);
    const updated = await prisma.schoolSession.update({ where: { id: schoolId }, data: parsed });

    // Cache invalidation
    const itemKey = cacheKey(`item:${schoolId}`);
    try {
      await redis.eval(INVAL_SCRIPT, [LIST_KEYS_SET]);
      await redis.del(itemKey);
    } catch {
      await Promise.all([
        redis.del(itemKey),
        redis.delPattern("schools:list:*"),
        redis.del(LIST_KEYS_SET),
      ]);
    }
    revalidateTag(CACHE_TAG);

    return { success: true, data: updated, status: 200 };
  },

  /** ---------- Delete School ---------- */
  async deleteSchool(user: { id: number; roles: string[] }, id: string) {
    const schoolId = Number(id);
    if (Number.isNaN(schoolId)) throw new NotFoundError("Invalid school ID");

    // Only SUPERADMIN or member ADMIN can delete
    const existing = await prisma.schoolSession.findFirst({ where: { id: schoolId, deletedAt: null } });
    if (!existing) throw new NotFoundError("School not found");

    if (!user.roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: user.id, schoolSessionId: schoolId, active: true },
      });
      if (!membership) throw new ForbiddenError("Not a member of this school");
    }

    const deleted = await prisma.schoolSession.update({ where: { id: schoolId }, data: { deletedAt: new Date() } });

    // Cache invalidation: delete item key and tracked list keys
    const itemKey = cacheKey(`item:${schoolId}`);
    try {
      await redis.eval(INVAL_SCRIPT, [LIST_KEYS_SET]);
      await redis.del(itemKey);
    } catch {
      await Promise.all([
        redis.del(itemKey),
        redis.delPattern("schools:list:*"),
        redis.del(LIST_KEYS_SET),
      ]);
    }
    revalidateTag(CACHE_TAG);

    return { success: true, data: deleted, status: 200 };
  },
};
