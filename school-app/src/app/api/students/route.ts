import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Student schema
export const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  class: z.string(),
  age: z.number(),
  parent: z.string(),
});

// ------------------------
// GET /api/students
// ------------------------
export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.student,
    schema: studentSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN","PRINCIPAL","TEACHER"],
    resourceName: "Student",
    method: "GET",
  })(req as any, user);
};

// ------------------------
// POST /api/students
// ------------------------
export const POST = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.student,
    schema: studentSchema,
    allowedRoles: ["ADMIN","PRINCIPAL","TEACHER"],
    resourceName: "Student",
    method: "POST",
  })(req as any, user);
};

// ------------------------
// PUT /api/students
// ------------------------
export const PUT = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.student,
    schema: studentSchema,
    allowedRoles: ["ADMIN","PRINCIPAL","TEACHER"],
    resourceName: "Student",
    method: "PUT",
  })(req as any, user);
};

// ------------------------
// DELETE /api/students
// ------------------------
export const DELETE = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.student,
    schema: studentSchema,
    allowedRoles: ["ADMIN","PRINCIPAL"],
    resourceName: "Student",
    method: "DELETE",
  })(req as any, user);
};
