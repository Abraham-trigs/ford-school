// /lib/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing in environment");

/**
 * Authenticates a request using Bearer token from Authorization header.
 * Optionally restricts access to specific roles.
 * Returns decoded payload with { userId, roles, exp, ... }.
 */
export function authenticate(
  req: NextRequest,
  allowedRoles?: string[]
): { userId: number; roles: string[] } {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw { status: 401, message: "Missing or invalid Authorization header" };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      roles: string[];
      exp: number;
    };

    // Optional role restriction
    if (allowedRoles?.length) {
      const hasAccess = decoded.roles.some((r) => allowedRoles.includes(r));
      if (!hasAccess) throw { status: 403, message: "Forbidden" };
    }

    return decoded;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw { status: 401, message: "Token expired" };
    }
    throw { status: 401, message: "Invalid token" };
  }
}

/**
 * (Optional) Utility: Refresh user roles from DB if needed
 * Can be called post-authentication to ensure fresh access control
 */
export async function getUserRoles(userId: number): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  return user?.roles ?? [];
}
