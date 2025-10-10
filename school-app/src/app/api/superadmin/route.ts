// src/app/api/superadmin/route.ts
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createCRUDHandler } from "@/features/api/crudServices";
import { getUserFromCookie } from "@/lib/auth/cookies";
import { redis } from "@/lib/redis";

export const superAdminSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  role: z.literal("SUPER_ADMIN").default("SUPER_ADMIN"),
});

async function invalidateSuperAdminCache() {
  const keys = await redis.keys("superadmin:*");
  if (keys.length) await redis.del(...keys);
}

export const GET = async (req: Request) => {
  const user = await getUserFromCookie();
  if (!user || user.role !== "SUPER_ADMIN") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  return createCRUDHandler({
    model: prisma.userAccount,
    schema: superAdminSchema,
    allowedRoles: ["SUPER_ADMIN"],
    resourceName: "SuperAdmin User",
    onAfterMutate: async () => {
      await invalidateSuperAdminCache();
    },
  })(req as any, user);
};

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
