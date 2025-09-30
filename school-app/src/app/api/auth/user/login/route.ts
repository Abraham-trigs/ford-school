// app/api/user/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  let body: LoginBody;

  // 1️⃣ Parse JSON body safely
  try {
    body = await req.json();
  } catch (err) {
    console.error("Failed to parse JSON body:", err);
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = body;

  // 2️⃣ Validate input
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  // 3️⃣ Fetch user from DB
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("Prisma error fetching user:", err);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }

  if (!user || !user.password) {
    return NextResponse.json({ message: "Invalid credentials or password not set" }, { status: 401 });
  }

  // 4️⃣ Verify password
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.error("Error comparing password:", err);
    return NextResponse.json({ message: "Password verification failed" }, { status: 500 });
  }

  if (!isValidPassword) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // 5️⃣ Sign JWT
  let token;
  try {
    token = signJwt({ id: user.id, role: user.role });
  } catch (err) {
    console.error("JWT signing error:", err);
    return NextResponse.json({ message: "Failed to generate token" }, { status: 500 });
  }

  // 6️⃣ Set auth cookie and respond
  try {
    const res = NextResponse.json({ message: "Login success", user: { id: user.id, email: user.email, role: user.role } });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    console.error("Error setting cookie:", err);
    return NextResponse.json({ message: "Failed to set auth cookie" }, { status: 500 });
  }
}
