// src/app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import {
  getUserFromCookie,
  createAndSetRefreshToken,
  clearRefreshCookie,
} from "@/lib/auth/cookies";

export async function GET() {
  const user = await getUserFromCookie();

  if (!user) {
    // Invalid or missing token → clear cookie
    clearRefreshCookie();
    return NextResponse.json(
      { message: "No or invalid refresh token" },
      { status: 401 }
    );
  }

  // Valid token → generate a new refresh token
  const newToken = createAndSetRefreshToken(user);

  return NextResponse.json({
    message: "Token refreshed",
    refreshToken: newToken,
    user,
  });
}
