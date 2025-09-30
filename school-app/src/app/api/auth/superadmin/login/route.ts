import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });

    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!superAdmin)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const isValid = await bcrypt.compare(password, superAdmin.password);
    if (!isValid)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = signJwt({ id: superAdmin.id, role: "SUPERADMIN" });

    const res = NextResponse.json({ message: "Login success" });
    res.cookies.set("auth_token", token, { httpOnly: true, path: "/", maxAge: 3600 });
    return res;
  } catch (err) {
    console.error("SuperAdmin login error:", err);
    return NextResponse.json({ message: "Something went wrong. Try again." }, { status: 500 });
  }
}
