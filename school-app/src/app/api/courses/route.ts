// /app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import { redis, addCacheTag } from "@/lib/redis";
import { authenticate } from "@/lib/auth";
import { rateLimiter } from "@/lib/ratelimit";
import { handleError } from "@/lib/utils/handleError";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/services/course";

// Zod schemas
const getQuerySchema = z.object({
  schoolSessionId: z
    .string()
    .regex(/^\d+$/)
    .transform((s) => parseInt(s))
    .optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
});

const postSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teacherId: z.number().optional(),
  schoolSessionId: z.number(),
});

const putSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  teacherId: z.number().optional(),
});

const deleteSchema = z.object({
  id: z.number(),
});

// GET /api/courses
export async function GET(req: NextRequest) {
  try {
    // Require ADMIN or SUPERADMIN to list courses
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const url = new URL(req.url);
    const query = getQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const schoolSessionId = query.schoolSessionId; // optional number

    // allowedSchoolIds only when needed (non-superadmin & no explicit schoolSessionId)
    let allowedSchoolIds: number[] | "all" = "all";
    if (!payload.roles.includes("SUPERADMIN") && schoolSessionId === undefined) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId: payload.userId, active: true },
        select: { schoolSessionId: true },
      });
      allowedSchoolIds = memberships.map((m) => m.schoolSessionId).sort((a, b) => a - b);
      if (allowedSchoolIds.length === 0) {
        return NextResponse.json({ data: [], meta: { page, pageSize, total: 0 } });
      }
    }

    // Compose stable cache key
    const schoolKeyPart =
      schoolSessionId !== undefined
        ? String(schoolSessionId)
        : allowedSchoolIds === "all"
        ? "all"
        : allowedSchoolIds.join(",");
    const cacheKey = `course:school:${schoolKeyPart}:page:${page}:size:${pageSize}`;

    // Return cached if present
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    // Rate limit DB-hitting request
    const limit = await rateLimiter.limit(String(payload.userId));
    if (!limit.success) throw new Error("RateLimit");

    // Fetch data
    const res = await getCourses({
      schoolSessionId,
      allowedSchoolIds,
      page,
      pageSize,
    });

    // Cache result & tag for invalidation
    await redis.set(cacheKey, JSON.stringify(res), { ex: 60 * 5 });
    // Tag by school(s); if a specific schoolSessionId was requested, tag that
    if (schoolSessionId !== undefined) {
      await addCacheTag([schoolSessionId], cacheKey, "course");
    } else if (Array.isArray(allowedSchoolIds)) {
      await addCacheTag(allowedSchoolIds, cacheKey, "course");
    } else {
      // global tag for superadmin views
      await addCacheTag("all", cacheKey, "course");
    }

    return NextResponse.json(res);
  } catch (err: any) {
    return handleError(err);
  }
}

// POST /api/courses
export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);

    // Rate limit
    const limit = await rateLimiter.limit(String(payload.userId));
    if (!limit.success) throw new Error("RateLimit");

    const body = postSchema.parse(await req.json());

    // createCourse contains service-level authorization and invalidation
    const course = await createCourse(body, payload);

    return NextResponse.json({ data: course, message: "Course created successfully" }, { status: 201 });
  } catch (err: any) {
    return handleError(err);
  }
}

// PUT /api/courses
export async function PUT(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);

    const limit = await rateLimiter.limit(String(payload.userId));
    if (!limit.success) throw new Error("RateLimit");

    const body = putSchema.parse(await req.json());

    const updated = await updateCourse(body, payload);

    return NextResponse.json({ data: updated, message: "Course updated successfully" });
  } catch (err: any) {
    return handleError(err);
  }
}

// DELETE /api/courses
export async function DELETE(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);

    const limit = await rateLimiter.limit(String(payload.userId));
    if (!limit.success) throw new Error("RateLimit");

    const body = deleteSchema.parse(await req.json());

    const deleted = await deleteCourse(body.id, payload);

    return NextResponse.json({ data: deleted, message: "Course deleted successfully" });
  } catch (err: any) {
    return handleError(err);
  }
}
