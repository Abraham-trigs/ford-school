// src/app/api/inspectors/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

export const inspectorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  department: z.string(),
  level: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.inspector,
    schema: inspectorSchema,
    allowedRoles: ["ADMIN", "INSPECTOR"],
    resourceName: "Inspector",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
