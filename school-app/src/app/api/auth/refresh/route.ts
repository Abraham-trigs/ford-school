import { NextResponse } from "next/server";
import {
  getUserFromRefresh,
  rotateTokens,
  clearAuthCookies,
} from "@/lib/auth/cookies";

export async function POST() {
  try {
    const user = await getUserFromRefresh();
    if (!user) {
      clearAuthCookies();
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const { accessToken, refreshToken } = await rotateTokens(user);

    return NextResponse.json({
      message: "Tokens refreshed successfully",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    clearAuthCookies();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
