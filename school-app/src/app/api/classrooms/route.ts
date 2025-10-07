import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { redis, addCacheTag, invalidateByTags } from "@/lib/redis";
import { rateLimiter } from "@/lib/rateLimiter";
import { z } from "zod";
import { handleError } from "@/lib/utils/handleError";
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "@/services/classroom";

// --------------------
// 🔹 Zod Schemas
// --------------------
const postSchema = z.object({
  name: z.string().min(1),
  grade: z.string().optional(),
  schoolSessionId: z.number(),
});

const putSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  grade: z.string().optional(),
});

const deleteSchema = z.object({
  id: z.number(),
  schoolSessionId: z.number(),
});

// --------------------
// 🔹 GET /api/classroom
// --------------------
export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const schoolId = url.searchParams.get("schoolId");

    // Non-superadmins: limit to their allowed school sessions
    let allowedSchoolIds: number[] | "all" = "all";
    if (!payload.roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId: payload.userId, active: true },
        select: { schoolSessionId: true },
      });
      allowedSchoolIds = memberships.map((m) => m.schoolSessionId);
      if (!allowedSchoolIds.length)
        return NextResponse.json({ data: [], meta: { page, pageSize } });
    }

    // Cache key
    const cacheKey = `classroom:school:${
      schoolId ?? (allowedSchoolIds === "all" ? "all" : allowedSchoolIds.sort().join(","))
    }:page:${page}:size:${pageSize}`;

    // 1️⃣ Serve cached if available
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    // 2️⃣ Rate limit only DB hits
    const limit = await rateLimiter.limit(payload.userId);
    if (!limit.success) throw new Error("RateLimit");

    // 3️⃣ Query classrooms
    const result = await getClassrooms({
      schoolId: schoolId ? parseInt(schoolId) : undefined,
      allowedSchoolIds,
      page,
      pageSize,
    });

    // 4️⃣ Cache + tag for invalidation
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 });
    await addCacheTag(allowedSchoolIds, cacheKey, "classroom");

    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

// --------------------
// 🔹 POST /api/classroom
// --------------------
export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const body = postSchema.parse(await req.json());

    const limit = await rateLimiter.limit(payload.userId);
    if (!limit.success) throw new Error("RateLimit");

    // Non-superadmins: check membership in school
    if (!payload.roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: payload.userId, schoolSessionId: body.schoolSessionId, active: true },
      });
      if (!membership) throw new Error("Forbidden");
    }

    const classroom = await createClassroom(body);

    // Invalidate cache for that school
    await invalidateByTags("classroom", [body.schoolSessionId]);

    return NextResponse.json({ data: classroom, message: "Classroom created successfully" }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// --------------------
// 🔹 PUT /api/classroom
// --------------------
export async function PUT(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const body = putSchema.parse(await req.json());

    const limit = await rateLimiter.limit(payload.userId);
    if (!limit.success) throw new Error("RateLimit");

    const updated = await updateClassroom(body, payload);

    // Invalidate cache by school
    await invalidateByTags("classroom", [updated.schoolSessionId]);

    return NextResponse.json({ data: updated, message: "Classroom updated successfully" });
  } catch (err) {
    return handleError(err);
  }
}

// --------------------
// 🔹 DELETE /api/classroom
// --------------------
export async function DELETE(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const body = deleteSchema.parse(await req.json());

    const limit = await rateLimiter.limit(payload.userId);
    if (!limit.success) throw new Error("RateLimit");

    await deleteClassroom(body.id, body.schoolSessionId, payload);

    await invalidateByTags("classroom", [body.schoolSessionId]);

    return NextResponse.json({ data: null, message: "Classroom deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
