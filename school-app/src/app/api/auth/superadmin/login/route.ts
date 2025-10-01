// app/api/auth/superadmin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    // Generic message so attackers can't enumerate emails
    if (!superAdmin || !(await bcrypt.compare(password, superAdmin.password))) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // JWT payload
    const token = signJwt({ sub: superAdmin.id, role: "SUPERADMIN" });

    const response = NextResponse.json(
      { message: "Login successful", user: { email: superAdmin.email, name: superAdmin.name } },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("SuperAdmin login error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
