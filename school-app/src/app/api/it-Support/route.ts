// src/app/api/itSupport/route.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// IT Support schema
export const itSupportSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  responsibility: z.string().optional(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.itSupport,
    schema: itSupportSchema,
    allowedRoles: ["ADMIN", "PRINCIPAL", "IT_SUPPORT"],
    resourceName: "IT Support",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
