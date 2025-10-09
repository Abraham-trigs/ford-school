// src/app/api/finance/route.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

const financeSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.finance,
    schema: financeSchema,
    allowedRoles: ["ADMIN","FINANCE"],
    resourceName: "Finance",
  })(req as any, user);
};
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
