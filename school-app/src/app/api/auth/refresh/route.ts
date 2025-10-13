import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  signAccessToken,
  rotateRefreshToken,
} from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;
  if (!token) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    const decoded = verifyRefreshToken(token);

    // Issue new access token
    const newAccessToken = signAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    // Rotate refresh token
    const newRefreshToken = rotateRefreshToken(token);

    const res = NextResponse.json({
      accessToken: newAccessToken,
      userId: decoded.userId,
    });

    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
