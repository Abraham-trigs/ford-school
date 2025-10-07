// app/api/assignments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { rateLimiter } from "@/lib/ratelimit";
import { handleError } from "@/lib/utils/handleError";
import { redis } from "@/lib/redis";
import { revalidateTag } from "next/cache";
import * as svc from "@/services/assignment";

//
// Zod schemas + types
//
const getQuerySchema = z.object({
  courseId: z.coerce.number().optional(),
  type: z.enum(["HOMEWORK", "QUIZ", "EXAM"]).optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(20),
}).strict();

const createSchema = z.object({
  courseId: z.coerce.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["HOMEWORK", "QUIZ", "EXAM"]).optional(),
  dueDate: z.string().optional(),
  metadata: z.any().optional(),
}).strict();

const updateSchema = createSchema.extend({
  id: z.coerce.number(),
}).strict();

const deleteSchema = z.object({ id: z.coerce.number() }).strict();

//
// deterministic stable key - must match service's stableKey logic
//
function stableKey(filters: Record<string, any>, page: number, pageSize: number) {
  const entries = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);
  entries.sort(([a], [b]) => a.localeCompare(b));
  const qs = entries.map(([k, v]) => `${k}=${v}`).join("&") || "all";
  return `assignments:${qs}:page=${page}:size=${pageSize}`;
}

//
// GET - cached, cache-bypass before rate-limit
//
export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN", "TEACHER"]);
    const params = Object.fromEntries(new URL(req.url).searchParams.entries());
    const q = getQuerySchema.parse(params);

    const filters = {
      courseId: q.courseId,
      type: q.type,
      dueDateFrom: q.dueDateFrom,
      dueDateTo: q.dueDateTo,
    };
    const key = stableKey(filters, q.page, q.pageSize);

    // if cached, return immediately and DO NOT rate-limit
    try {
      const cached = await redis.get(key);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    } catch (e) {
      // do not fail on cache reads
      console.warn("redis.get failed", e);
    }

    // not cached => rate-limit per-user then hit DB
    const rl = await rateLimiter.limit(String(payload.userId));
    if (!rl.success) throw { status: 429, message: "Too many requests" };

    const result = await svc.getAssignments({
      filters,
      page: q.page,
      pageSize: q.pageSize,
      requester: { userId: payload.userId, roles: payload.roles },
      cacheKey: key, // let service store cache & tag it
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return handleError(err);
  }
}

//
// POST - create (authorizes inside service, invalidates tags + revalidateTag)
//
export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN", "TEACHER"]);
    const rl = await rateLimiter.limit(String(payload.userId));
    if (!rl.success) throw { status: 429, message: "Too many requests" };

    const body = createSchema.parse(await req.json());

    const created = await svc.createAssignment({
      data: body,
      requester: { userId: payload.userId, roles: payload.roles },
    });

    // revalidate Next.js tags for immediate consistency (optional + safe)
    revalidateTag("assignments");
    revalidateTag(`assignments:course:${created.courseId}`);

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    return handleError(err);
  }
}

//
// PUT - update (service enforces deletedAt check + RBAC)
//
export async function PUT(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN", "TEACHER"]);
    const rl = await rateLimiter.limit(String(payload.userId));
    if (!rl.success) throw { status: 429, message: "Too many requests" };

    const body = updateSchema.parse(await req.json());

    const updated = await svc.updateAssignment({
      data: body,
      requester: { userId: payload.userId, roles: payload.roles },
    });

    revalidateTag("assignments");
    revalidateTag(`assignments:course:${updated.courseId}`);

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return handleError(err);
  }
}

//
// DELETE - soft delete (body { id })
//
export async function DELETE(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN", "TEACHER"]);
    const rl = await rateLimiter.limit(String(payload.userId));
    if (!rl.success) throw { status: 429, message: "Too many requests" };

    const body = deleteSchema.parse(await req.json());
    const deleted = await svc.deleteAssignment({
      id: body.id,
      requester: { userId: payload.userId, roles: payload.roles },
    });

    revalidateTag("assignments");
    revalidateTag(`assignments:course:${deleted.courseId}`);

    return NextResponse.json({ data: deleted });
  } catch (err: any) {
    return handleError(err);
  }
}
