// src/app/api/nurses/route.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Nurse schema
export const nurseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  shift: z.string().optional(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.nurse,
    schema: nurseSchema,
    allowedRoles: ["ADMIN", "PRINCIPAL", "NURSE"],
    resourceName: "Nurse",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
