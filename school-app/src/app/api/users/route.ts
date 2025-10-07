// /app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/utils/error";
import { userService } from "@/lib/services/userService";
import { rateLimiter } from "@/lib/ratelimit";

/* -------------------------
   Zod schemas (route-level)
   - route validates incoming request; service trusts validated shape
   ------------------------- */
const querySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(20),
});

const createUserSchema = z
  .object({
    email: z.string().email(),
    fullName: z.string().min(2),
    password: z.string().min(8),
    profilePicture: z.string().optional(),
    role: z.string(),
    schoolSessionId: z.number().optional(),
    profileData: z.record(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    // reuse central roles list from config if desired (import to keep small)
    const rolesWithSchool = [
      "ADMIN","PRINCIPAL","VICE_PRINCIPAL","TEACHER","ASSISTANT_TEACHER",
      "COUNSELOR","LIBRARIAN","EXAM_OFFICER","FINANCE","HR","RECEPTIONIST",
      "IT_SUPPORT","TRANSPORT","NURSE","COOK","CLEANER","SECURITY","MAINTENANCE",
      "STUDENT","CLASS_REP","PARENT",
    ];
    if (rolesWithSchool.includes(data.role) && !data.schoolSessionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "schoolSessionId is required for this role",
      });
    }
  });

/* -------------------------
   GET handler
   - thin: auth + validation -> delegate to service
   ------------------------- */
export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const params = Object.fromEntries(new URL(req.url).searchParams.entries());
    const q = querySchema.parse(params);

    const result = await userService.getUsers({
      requester: { userId: payload.userId, roles: payload.roles },
      query: q,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return handleError(err, "GET /api/users");
  }
}

/* -------------------------
   POST handler
   - route-level write rate limit + auth
   ------------------------- */
export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);

    const rl = await rateLimiter.limit(String(payload.userId));
    if (!rl.success) throw new ApiError(429, "Too many requests");

    const body = await req.json();
    const parsed = createUserSchema.parse(body);

    const created = await userService.createUser({
      requester: { userId: payload.userId, roles: payload.roles },
      data: parsed,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    return handleError(err, "POST /api/users");
  }
}
