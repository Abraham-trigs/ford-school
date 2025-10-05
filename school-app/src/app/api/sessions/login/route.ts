import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = 60 * 60; // 1h in seconds
const REFRESH_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: true },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password || "");
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const roles = user.memberships.map((m) => m.role);
    const payload = { userId: user.id, roles };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Save refresh session
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN * 1000);
    await prisma.userSession.create({ data: { userId: user.id, token, expiresAt } });

    const res = NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          roles,
        },
      },
    });

    // HttpOnly cookie for frontend
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: JWT_EXPIRES_IN,
    });

    return res;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
