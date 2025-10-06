"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { createStaff } from "@/services/staff";
import { createStaffResponse } from "@/utils/api";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

const staffRoles = [
  "FINANCE","HR","RECEPTIONIST","IT_SUPPORT","TRANSPORT",
  "NURSE","COOK","CLEANER","SECURITY","MAINTENANCE"
];

const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") });

const getQuerySchema = z.object({
  role: z.enum(staffRoles).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().regex(/^\d+$/).optional(),
});

const postBodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  profilePicture: z.string().url().optional(),
  role: z.enum(staffRoles),
  schoolSessionId: z.string().uuid(),
  profileData: z.object({
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["MALE","FEMALE"]).optional(),
  }).optional(),
});

// Lua script for atomic invalidation
const invalidateScript = `
  local keys = redis.call('SMEMBERS', KEYS[1])
  if #keys > 0 then redis.call('DEL', unpack(keys)) end
  redis.call('DEL', KEYS[1])
  return keys
`;

export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const { roles, userId } = payload;

    const url = new URL(req.url);
    const query = getQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const page = parseInt(query.page || "1");
    const pageSize = parseInt(query.pageSize || "20");

    let allowedSchoolIds: string[] | undefined;
    if (!roles.includes("SUPERADMIN")) {
      allowedSchoolIds = (await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true }
      })).map(m => m.schoolSessionId).sort();

      if (!allowedSchoolIds.length) {
        return NextResponse.json(createStaffResponse([], page, pageSize, 0));
      }
    }

    const cacheKey = `staff:${query.role || "all"}:${page}:${allowedSchoolIds?.join(",") || "all"}`;
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    const staffWhere: any = {};
    if (query.role) staffWhere.role = query.role;
    if (allowedSchoolIds) staffWhere.memberships = { some: { schoolSessionId: { in: allowedSchoolIds }, active: true } };

    // Efficient pagination + total count
    const [staffProfiles, total] = await prisma.$transaction([
      prisma.staffProfile.findMany({
        where: staffWhere,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { user: true, memberships: { include: { schoolSession: true } } }
      }),
      prisma.staffProfile.count({ where: staffWhere })
    ]);

    const responseData = createStaffResponse(staffProfiles, page, pageSize, total);
    await redis.set(cacheKey, JSON.stringify(responseData), { ex: 30 });

    // Track cache key for targeted invalidation
    const roleKeysSet = `staff:school:${allowedSchoolIds?.join(",") || "all"}:role:${query.role || "all"}:keys`;
    await redis.sadd(roleKeysSet, cacheKey);

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("GET /api/staff failed", { error: err });
    const status = err instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({
      error: {
        type: err instanceof z.ZodError ? "validation" : "server",
        message: err.message,
        details: err instanceof z.ZodError ? err.errors : undefined
      }
    }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const { roles, userId: requesterId } = payload;

    const limit = await ratelimit.limit(requesterId);
    if (!limit.success) return NextResponse.json({
      error: { type: "rate_limit", message: "Rate limit exceeded" }
    }, { status: 429 });

    const body = postBodySchema.parse(await req.json());
    const staffUser = await createStaff(body, requesterId, roles);

    const allowedSchoolIds = [body.schoolSessionId];
    const roleKeysSet = `staff:school:${allowedSchoolIds.join(",")}:role:${body.role}:keys`;
    await redis.eval(invalidateScript, [roleKeysSet]);

    const createdProfile = await prisma.staffProfile.findFirst({
      where: { userId: staffUser.id },
      include: { user: true, memberships: { include: { schoolSession: true } } }
    });

    return NextResponse.json({ data: createdProfile }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/staff failed", { error: err });
    const status = err instanceof z.ZodError ? 400 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({
      error: {
        type: err instanceof z.ZodError ? "validation" : err.message === "Forbidden" ? "auth" : "server",
        message: err.message,
        details: err instanceof z.ZodError ? err.errors : undefined
      }
    }, { status });
  }
}
