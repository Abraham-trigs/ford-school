import { z } from "zod";

// Match Prisma enum values
export const financeTypeEnum = z.enum(["INCOME", "EXPENSE", "SALARY", "PURCHASE", "OTHER"]);

export const financeRecordSchema = z.object({
  id: z.string().optional(),
  type: financeTypeEnum,
  amount: z.number().positive("Amount must be positive"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  schoolId: z.string().optional(),
});

export type FinanceRecord = z.infer<typeof financeRecordSchema>;
export type FinanceType = z.infer<typeof financeTypeEnum>;
