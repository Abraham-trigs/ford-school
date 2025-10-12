import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/auth.validator";
import { loginUser } from "@/features/auth/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);

    const { user, accessToken, refreshToken } = await loginUser(
      parsed.email,
      parsed.password
    );

    const res = NextResponse.json({ user });
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Login failed" }, { status: 400 });
  }
}
