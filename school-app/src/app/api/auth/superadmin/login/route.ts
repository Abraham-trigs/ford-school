import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { createSession } from "@/lib/superadmin/auth/session";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: email.toLowerCase() }
      });    
    if (!superAdmin) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, superAdmin.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ---------------------
    // Generate tokens
    // ---------------------
    const accessToken = jwt.sign(
      {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: "SUPERADMIN",
      },
      JWT_SECRET,
      { expiresIn: "15m" } // short-lived
    );

    const refreshToken = uuidv4();
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // ---------------------
    // Client info
    // ---------------------
    const userAgent = req.headers.get("user-agent") || null;
    const ipAddress =
      req.headers.get("x-forwarded-for") || (req as any).ip || "unknown";

    // ---------------------
    // Save session (via helper)
    // ---------------------
    await createSession({
      superAdminId: superAdmin.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt,
      userAgent,
      ipAddress: ipAddress.toString(),
    });

    return NextResponse.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      superAdmin: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
