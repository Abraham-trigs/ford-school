"use server";

import { cookies } from "next/headers";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
  schoolId?: string | null;
}

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "formless_refresh_token";

// ------------------------
// Get user from access token (for SSR + middleware)
// ------------------------
export async function getUserFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const user = verifyAccessToken(token) as JWTPayload;
    return user;
  } catch (err) {
    console.error("❌ Invalid or expired access token:", err);
    return null;
  }
}

// ------------------------
// Set access token cookie (short-lived, 15m)
// ------------------------
export async function setAccessCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
}

// ------------------------
// Set refresh token cookie (long-lived, 7 days)
// ------------------------
export async function setRefreshCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// ------------------------
// Clear both cookies (logout)
// ------------------------
export async function clearAuthCookies() {
  const cookieStore = cookies();
  [ACCESS_COOKIE, REFRESH_COOKIE].forEach((name) => {
    cookieStore.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  });
}

// ------------------------
// Verify refresh token and issue new tokens
// ------------------------
export async function rotateTokens(user: JWTPayload) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await setAccessCookie(accessToken);
  await setRefreshCookie(refreshToken);
  return { accessToken, refreshToken };
}

// ------------------------
// Validate and return user from refresh cookie
// ------------------------
export async function getUserFromRefresh(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!token) return null;

  try {
    const user = verifyRefreshToken(token) as JWTPayload;
    return user;
  } catch (err) {
    console.error("❌ Invalid or expired refresh token:", err);
    return null;
  }
}
