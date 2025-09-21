// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

export type JwtPayloadShape = {
  sub: string; // user id
  role?: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_secret";

export async function verifyJwtFromHeader(authorization?: string): Promise<{ userId: string; role?: string } | null> {
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadShape;
    if (!decoded?.sub) return null;

    // fetch the user from DB to ensure it exists and return role
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, status: true },
    });
    if (!user) return null;
    if (user.status !== "ACTIVE") return null; // optional enforcement
    return { userId: user.id, role: user.role };
  } catch (err) {
    return null;
  }
}

export function requireRoles(roles: string[], userRole?: string) {
  if (!userRole) return false;
  return roles.includes(userRole);
}
