import { z } from "zod";

export const studentSchema = z.object({
  id: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  class: z.string(),
  section: z.string().optional(),
  age: z.number().int().min(3).max(25),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(), // ISO string
  parentName: z.string(),
  parentPhone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});
