// lib/auth/auth.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_secret";

// Sign a payload into a JWT
export function signJWT(payload: Record<string, any>, expiresIn = "24h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify a JWT
export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch {
    return null;
  }
}

// Set JWT as HttpOnly cookie in NextResponse
export function setJWTCookie(res: NextResponse, token: string) {
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}
