// /api/auth/superadmin/refresh.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// POST /api/auth/superadmin/refresh
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token required" }, { status: 400 });
    }

    // Find session
    const session = await prisma.superAdminSession.findUnique({
      where: { token: refreshToken },
      include: { superAdmin: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Issue new access token
    const accessToken = jwt.sign(
      {
        id: session.superAdmin.id,
        email: session.superAdmin.email,
        name: session.superAdmin.name,
        role: "SUPERADMIN",
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({
      accessToken,
      superAdmin: {
        id: session.superAdmin.id,
        name: session.superAdmin.name,
        email: session.superAdmin.email,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
