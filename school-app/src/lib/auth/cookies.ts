import { cookies } from "next/headers";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JWTPayload,
} from "./jwt";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "formless_refresh_token";

// -----------------------------------------------------------------------------
// Read access token → returns decoded user payload or null
// -----------------------------------------------------------------------------
export async function getUserFromCookie(): Promise<JWTPayload | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Attach BOTH cookies (access + refresh) to NextResponse
// -----------------------------------------------------------------------------
export function attachAuthCookies(res: Response | any, user: JWTPayload) {
  const cookieStore = cookies();
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  // Access: short-lived (15 min)
  cookieStore.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  // Refresh: long-lived (7 days)
  cookieStore.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}

// -----------------------------------------------------------------------------
// Clear both cookies on logout / invalidation
// -----------------------------------------------------------------------------
export function clearAuthCookies(res: Response | any) {
  const cookieStore = cookies();
  [ACCESS_COOKIE, REFRESH_COOKIE].forEach((name) =>
    cookieStore.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
  return res;
}

// -----------------------------------------------------------------------------
// Rotate tokens – for refresh route or middleware auto-renewal
// -----------------------------------------------------------------------------
export function rotateTokens(res: Response | any, user: JWTPayload) {
  return attachAuthCookies(res, user);
}
