import { cookies } from "next/headers";
import { signRefreshToken, verifyRefreshToken, JWTPayload } from "./jwt";

const COOKIE_NAME = "formless_refresh_token";

// ------------------------
// Get user from cookie
// ------------------------
export async function getUserFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    // Returns { userId, role }
    const user = verifyRefreshToken(token);
    return user;
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}

// ------------------------
// Set refresh cookie
// ------------------------
export function setRefreshCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// ------------------------
// Clear refresh cookie
// ------------------------
export function clearRefreshCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// ------------------------
// Helper: create and set new refresh token
// ------------------------
export function createAndSetRefreshToken(user: JWTPayload) {
  const token = signRefreshToken(user);
  setRefreshCookie(token);
  return token;
}
