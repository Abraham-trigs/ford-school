// /api/student/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { redis } from "@/lib/redis";
import { authenticate } from "@/lib/auth";
import { z } from "zod";
import { rateLimiter } from "@/lib/rateLimiter";
import { createStudent, updateStudent, deleteStudent } from "@/services/student";

// --------------------
// Zod Schemas
// --------------------
const getQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().regex(/^\d+$/).optional(),
});

const postBodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  profilePicture: z.string().url().optional(),
  schoolSessionId: z.string().uuid(),
  profileData: z.record(z.any()).optional(),
});

const putBodySchema = z.object({
  userId: z.string().uuid(),
  schoolSessionId: z.string().uuid(),
  profileData: z.record(z.any()).optional(),
});

const deleteBodySchema = z.object({
  userId: z.string().uuid(),
  schoolSessionId: z.string().uuid(),
});

// --------------------
// Utility: Error Handling
// --------------------
function handleError(err: any) {
  console.error(err);
  const status = err instanceof z.ZodError
    ? 400
    : err.message === "Forbidden"
    ? 403
    : err.message === "RateLimit"
    ? 429
    : err.message === "NotFound"
    ? 404
    : 500;

  const errorType = err instanceof z.ZodError
    ? "Validation"
    : ["Forbidden", "RateLimit", "NotFound"].includes(err.message)
    ? err.message
    : "ServerError";

  const details = err instanceof z.ZodError ? err.errors : undefined;

  return NextResponse.json({
    error: {
      type: errorType,
      message: err.message || "Internal server error",
      details,
    },
  }, { status });
}

// --------------------
// Redis Lua Script: Atomic Invalidate
// --------------------
const invalidateCacheScript = `
local keys = redis.call("SMEMBERS", KEYS[1])
if #keys > 0 then
  redis.call("DEL", unpack(keys))
end
redis.call("DEL", KEYS[1])
return keys
`;

// --------------------
// GET Handler
// --------------------
export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const url = new URL(req.url);
    const query = getQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const page = parseInt(query.page || "1");
    const pageSize = parseInt(query.pageSize || "20");

    // Determine allowed schools
    let allowedSchoolIds: string[] | "all" = "all";
    if (!payload.roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId: payload.userId, active: true },
        select: { schoolSessionId: true },
      });
      allowedSchoolIds = memberships.map(m => m.schoolSessionId).sort();
      if (allowedSchoolIds.length === 0) return NextResponse.json({ data: [], meta: { page, pageSize, total: 0 } });
    }

    const schoolIdentifier = Array.isArray(allowedSchoolIds) ? allowedSchoolIds.join(",") : "all";
    const cacheKey = `student:school:${schoolIdentifier}:page:${page}:size:${pageSize}`;

    // Serve from cache if available
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    // Rate limit DB-hitting request
    const limit = await rateLimiter.limit(payload.userId);
    if (!limit.success) throw new Error("RateLimit");

    // Prisma filter
    const where: any = {};
    if (allowedSchoolIds !== "all") {
      where.memberships = { some: { schoolSessionId: { in: allowedSchoolIds }, active: true } };
    }

    // Fetch students + total in one transaction
    const [students, total] = await prisma.$transaction([
      prisma.studentProfile.findMany({
        where,
        include: { user: true, memberships: { include: { schoolSession: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.studentProfile.count({ where }),
    ]);

    const responseData = { data: students, meta: { page, pageSize, total } };

    // Cache and add to tag set
    await redis.set(cacheKey, JSON.stringify(responseData), { ex: 30 });
    const tagSetKey = `student:school:${schoolIdentifier}:keys`;
    await redis.sadd(tagSetKey, cacheKey);

    return NextResponse.json(responseData);
  } catch (err: any) {
    return handleError(err);
  }
}

// --------------------
// POST Handler
// --------------------
export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const body = postBodySchema.parse(await req.json());

    // Authorization for non-SUPERADMIN
    if (!payload.roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: payload.userId, schoolSessionId: body.schoolSessionId, active: true },
      });
      if (!membership) throw new Error("Forbidden");
    }

    const student = await createStudent(body);

    // Invalidate cache
    const tagSetKey = `student:school:${body.schoolSessionId}:keys`;
    await redis.eval(invalidateCacheScript, [tagSetKey]);

    return NextResponse.json({ data: student });
  } catch (err: any) {
    return handleError(err);
  }
}

// --------------------
// PUT Handler
// --------------------
export async function PUT(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const body = putBodySchema.parse(await req.json());

    // Authorization for non-SUPERADMIN
    if (!payload.roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId: payload.userId, schoolSessionId: body.schoolSessionId, active: true },
      });
      if (!membership) throw new Error("Forbidden");
    }

    const updatedStudent = await updateStudent(body);

    // Invalidate cache
    const tagSetKey = `student:school:${body.schoolSessionId}:keys`;
    await redis.eval(invalidateCacheScript, [tagSetKey]);

    return NextResponse.json({ data: updatedStudent });
  } catch (err: any) {
    return handleError(err);
  }
}

// --------------------
// DELETE Handler
// --------------------
export async function DELETE(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const body = deleteBodySchema.parse(await req.json());

    // Find membership to authorize
    const membership = await prisma.userSchoolSession.findFirst({
      where: { userId: body.userId, schoolSessionId: body.schoolSessionId, role: "STUDENT" },
      select: { schoolSessionId: true },
    });
    if (!membership) throw new Error("NotFound");

    if (!payload.roles.includes("SUPERADMIN")) {
      const isAdmin = await prisma.userSchoolSession.findFirst({
        where: { userId: payload.userId, schoolSessionId: body.schoolSessionId, active: true },
      });
      if (!isAdmin) throw new Error("Forbidden");
    }

    await deleteStudent(body.userId, body.schoolSessionId);

    // Invalidate cache
    const tagSetKey = `student:school:${membership.schoolSessionId}:keys`;
    await redis.eval(invalidateCacheScript, [tagSetKey]);

    return NextResponse.json({ data: null, message: "Student deleted successfully" });
  } catch (err: any) {
    return handleError(err);
  }
}
