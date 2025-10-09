import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Class schema
export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  grade: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.class,
    schema: classSchema,
    allowedRoles: ["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
    resourceName: "Class",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
