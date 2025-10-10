import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

export const teacherSchema = z.object({
  id: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["TEACHER", "HEAD_TEACHER", "ADMIN"]).optional(),
  subjects: z.array(z.string()),
  classes: z.array(z.string()),
  active: z.boolean().optional(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.teacher,
    schema: teacherSchema,
    allowedRoles: ["ADMIN", "HEAD_TEACHER", "TEACHER"],
    resourceName: "Teacher",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
