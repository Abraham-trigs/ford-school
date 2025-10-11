import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";

// Guest schema
export const guestSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  purpose: z.string(),
  contact: z.string(),
  visitDate: z.string(),
});

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  return createCRUDHandler({
    model: prisma.guest,
    schema: guestSchema,
    allowedRoles: [ "SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "SECURITY"],
    resourceName: "Guest",
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
