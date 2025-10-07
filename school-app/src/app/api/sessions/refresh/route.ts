// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma/prisma";
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry, parseDuration, env } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const oldToken = req.cookies.get("refreshToken")?.value;
    if (!oldToken) return NextResponse.json({ message: "No refresh token" }, { status: 401 });

    let payload: any;
    try { payload = jwt.verify(oldToken, env.JWT_REFRESH_SECRET); }
    catch { return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 }); }

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      if (storedToken?.familyId) {
        await prisma.refreshToken.updateMany({ where: { familyId: storedToken.familyId }, data: { revoked: true } });
      }
      return NextResponse.json({ message: "Refresh token invalidated" }, { status: 401 });
    }

    const familyId = storedToken.familyId!;
    const user = await prisma.user.findUnique({ where: { id: storedToken.userId }, include: { memberships: true } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 401 });

    const newRefreshToken = generateRefreshToken(user, familyId);
    const newAccessToken = generateAccessToken(user);
    const expiresAt = getRefreshTokenExpiry();

    await prisma.$transaction([
      prisma.refreshToken.update({ where: { token: oldToken }, data: { revoked: true } }),
      prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, familyId, expiresAt } }),
    ]);

    const res = NextResponse.json({ accessToken: newAccessToken });
    res.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
    });

    return res;
  } catch (err) {
    console.error("[RefreshRoute] Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
