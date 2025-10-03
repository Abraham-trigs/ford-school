import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("superAdminRefreshToken")?.value;
    if (!refreshToken) return NextResponse.json({ message: "No refresh token" }, { status: 401 });

    const session = await prisma.superAdminSession.findUnique({
      where: { token: refreshToken },
      include: { superAdmin: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const accessToken = jwt.sign({ id: session.superAdmin.id, name: session.superAdmin.name, email: session.superAdmin.email, role: "SUPERADMIN" }, JWT_SECRET, { expiresIn: "15m" });

    return NextResponse.json({ accessToken, superAdmin: { id: session.superAdmin.id, name: session.superAdmin.name, email: session.superAdmin.email } });

  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
