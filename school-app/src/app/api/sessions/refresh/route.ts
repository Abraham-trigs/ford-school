import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AuthPayload } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    // Verify refresh token
    let payload: AuthPayload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthPayload;
    } catch {
      return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Optional: here you could check DB if user still exists or is active

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: payload.userId, roles: payload.roles, email: payload.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Rotate refresh token
    const newRefreshToken = jwt.sign(
      { userId: payload.userId, roles: payload.roles, email: payload.email },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    const response = NextResponse.json({ accessToken });

    // Set httpOnly cookie for refresh token
    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseInt(JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60, // fallback to 7 days
    });

    return response;
  } catch (err) {
    console.error("[RefreshRoute] Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
