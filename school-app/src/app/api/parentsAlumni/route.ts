// src/app/api/parentsAlumni/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Parent/Alumni schema
export const parentAlumniSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  relation: z.string().optional(), // parent, alumni, guardian, etc
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user)
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.parentAlumni,
    schema: parentAlumniSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "PARENT", "ALUMNI"],
    resourceName: "ParentAlumni",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
