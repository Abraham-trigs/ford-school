// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma/prisma";
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry, parseDuration, env } from "@/lib/jwt";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ message: "Authentication failed" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: { where: { active: true } } },
    });

    if (!user || user.memberships.length === 0) return NextResponse.json({ message: "Authentication failed" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.memberships[0].password);
    if (!valid) return NextResponse.json({ message: "Authentication failed" }, { status: 401 });

    const familyId = uuidv4();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, familyId);
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, familyId, expiresAt } });

    const res = NextResponse.json({ accessToken });
    res.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
    });

    return res;
  } catch (err) {
    console.error("[LoginRoute] Error:", err);
    return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
  }
}
