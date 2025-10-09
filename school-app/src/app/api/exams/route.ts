import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Exam schema
export const examSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string(), // ISO string
  classId: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.exam,
    schema: examSchema,
    allowedRoles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    resourceName: "Exam",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
