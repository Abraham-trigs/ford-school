// src/app/api/exams/route.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

const examSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  class: z.string(),
  subject: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.exam,
    schema: examSchema,
    allowedRoles: ["ADMIN","EXAM_OFFICER","TEACHER"],
    resourceName: "Exam",
  })(req as any, user);
};
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
