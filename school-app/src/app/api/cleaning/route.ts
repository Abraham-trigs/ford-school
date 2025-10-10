// src/app/api/cleaning/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

export const cleaningStaffSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  shift: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.cleaningStaff,
    schema: cleaningStaffSchema,
    allowedRoles: ["ADMIN", "PRINCIPAL"],
    resourceName: "Cleaning Staff",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
