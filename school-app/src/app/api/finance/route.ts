// src/app/api/finance/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";
import { redis } from "@/lib/redis";

export const financeRecordSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string(),
  amount: z.number(),
  description: z.string().optional(),
  date: z.string(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE_MONEY", "CHEQUE", "OTHER"]),
  referenceNo: z.string().optional(),
  approvedBy: z.string().optional(),
  createdBy: z.string().optional(),
  schoolId: z.string().optional(),
});

async function invalidateFinanceCache(schoolId: string) {
  const keys = await redis.keys(`finance:insight:${schoolId}:*`);
  if (keys.length > 0) await redis.del(...keys);
}

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.financeRecord,
    schema: financeRecordSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "FINANCE"],
    resourceName: "Finance Record",
    onBeforeCreate: async (data, user) => ({
      ...data,
      createdBy: user.id,
      schoolId: user.schoolId,
    }),
    onAfterMutate: async (record) => {
      await invalidateFinanceCache(record.schoolId);
    },
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
