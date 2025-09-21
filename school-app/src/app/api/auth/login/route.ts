export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use findFirst in case email is nullable
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Your account is inactive or suspended" },
        { status: 403 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token including `name`
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      SECRET,
      { expiresIn: EXPIRES_IN }
    );

    // Respond with user info
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set HttpOnly cookie
    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
