// src/app/api/hr/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

export const hrSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.hR,
    schema: hrSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR"],
    resourceName: "HR",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
