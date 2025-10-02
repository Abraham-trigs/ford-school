import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { createSession, revokeSessions } from "@/lib/superadmin/auth/session";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token required" },
        { status: 400 }
      );
    }

    // 🔍 Verify refresh token in DB
    const session = await prisma.superAdminSession.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { superAdmin: true },
    });

    if (!session || !session.superAdmin) {
      return NextResponse.json(
        { message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // ♻️ Revoke old refresh token (via helper)
    await revokeSessions(session.superAdminId, { token: refreshToken });

    // 🔑 Create new refresh token (via helper)
    const newRefreshToken = uuidv4();
    const newRefreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await createSession({
      superAdminId: session.superAdminId,
      token: newRefreshToken,
      expiresAt: newRefreshExpiry,
    });

    // 🎟️ Issue new short-lived access token
    const newAccessToken = jwt.sign(
      {
        id: session.superAdmin.id,
        name: session.superAdmin.name,
        email: session.superAdmin.email,
        role: "SUPERADMIN",
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
