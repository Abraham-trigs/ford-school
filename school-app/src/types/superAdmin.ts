// src/types/superadmin.ts
import { z } from "zod";

// Zod schema for a SuperAdmin user
export const superAdminSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email address"),
  passwordHash: z.string().optional(), // hashed password
  role: z.literal("SUPER_ADMIN").default("SUPER_ADMIN"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// TypeScript types inferred from the Zod schema
export type SuperAdmin = z.infer<typeof superAdminSchema>;

// School type for SuperAdmin dashboard
export interface School {
  id: string;
  name: string;
}
