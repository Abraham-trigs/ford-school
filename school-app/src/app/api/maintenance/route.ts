// src/app/api/maintenance/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Maintenance staff schema
export const maintenanceSchema = z.object({
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
    model: prisma.maintenance,
    schema: maintenanceSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "MAINTENANCE"],
    resourceName: "Maintenance",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
