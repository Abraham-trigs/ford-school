// src/app/api/library/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

export const librarySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  quantity: z.number(),
  location: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.library,
    schema: librarySchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "LIBRARY"],
    resourceName: "Library",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
