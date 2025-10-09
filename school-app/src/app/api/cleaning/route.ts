import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Cleaning staff schema
export const cleaningSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  shift: z.string(),
  contact: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.cleaning,
    schema: cleaningSchema,
    allowedRoles: ["ADMIN", "HR", "MAINTENANCE"],
    resourceName: "Cleaning Staff",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
