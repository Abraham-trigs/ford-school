import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma"; // your prisma client
import { compare } from "bcryptjs";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const isValid = await compare(password, user.password);
  if (!isValid) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = signJwt({ id: user.id, role: user.role });

  const res = NextResponse.json({ message: "Login success" });
  res.cookies.set("auth_token", token, { httpOnly: true, path: "/", maxAge: 3600 }); // 1h
  return res;
}
