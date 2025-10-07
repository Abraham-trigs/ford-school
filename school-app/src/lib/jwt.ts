// src/lib/jwt.ts
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User, Membership } from "@prisma/client";
import { env } from "./env";

export interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
  familyId?: string;
}

export function parseDuration(duration: string) {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) throw new Error("Invalid duration format");
  const value = parseInt(match[1]);
  switch (match[2]) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: throw new Error("Invalid duration unit");
  }
}

export function generateAccessToken(user: User & { memberships: Membership[] }): string {
  const roles = user.memberships.map((m) => m.role);
  return jwt.sign({ userId: user.id, email: user.email, roles }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function generateRefreshToken(user: User & { memberships: Membership[] }, familyId: string): string {
  const roles = user.memberships.map((m) => m.role);
  return jwt.sign({ userId: user.id, email: user.email, roles, familyId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN) * 1000);
}
