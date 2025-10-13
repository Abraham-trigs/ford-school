import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rotateTokens, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);

    // only email and password now
    const { user, accessToken, refreshToken } = await loginUser(
      parsed.email,
      parsed.password
    );

    const res = NextResponse.json({ user, accessToken });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { message: err.message || "Login failed" },
      { status: 400 }
    );
  }
}
