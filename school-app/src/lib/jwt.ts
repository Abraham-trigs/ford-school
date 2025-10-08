// src/lib/jwt.ts
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User, UserSchoolSession } from "@prisma/client";
import { env } from "./env";

export interface AuthPayload {
  userId: number;
  email: string;
  roles: string[];
  schoolSessionId?: number;
  familyId?: string;
}

export function parseDuration(duration: string) {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) throw new Error("Invalid duration format");
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: throw new Error("Invalid duration unit");
  }
}

/**
 * Generate access token based on user + active school session
 */
export function generateAccessToken(user: User & { activeSchoolSession?: UserSchoolSession }): string {
  const roles = user.activeSchoolSession ? [user.activeSchoolSession.role] : [];
  const schoolSessionId = user.activeSchoolSession?.schoolSessionId;
  return jwt.sign({ userId: user.id, email: user.email, roles, schoolSessionId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Generate refresh token (includes familyId)
 */
export function generateRefreshToken(user: User & { activeSchoolSession?: UserSchoolSession }, familyId: string): string {
  const roles = user.activeSchoolSession ? [user.activeSchoolSession.role] : [];
  const schoolSessionId = user.activeSchoolSession?.schoolSessionId;
  return jwt.sign({ userId: user.id, email: user.email, roles, schoolSessionId, familyId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Calculate refresh token expiry date
 */
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN) * 1000);
}
