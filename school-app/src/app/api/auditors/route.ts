// src/app/api/auditors/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

export const auditorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  department: z.string(),
  level: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.auditor,
    schema: auditorSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "AUDITOR"],
    resourceName: "Auditor",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
