// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJWT, setJWTCookie } from "@/lib/auth/auth";
import { getUserInclude } from "@/lib/prisma/includes";
import { v4 as uuidv4 } from "uuid";
import { verifySession } from "@/lib/auth/session/session";

/**
 * Helper: Create a session and JWT
 */
async function createSession(userId: string, req: NextRequest) {
  const sessionKey = uuidv4();

  const session = await prisma.sessionData.create({
    data: {
      userId,
      sessionKey,
      device: req.headers.get("user-agent") ?? undefined,
      ip: req.ip ?? undefined,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
    include: { user: getUserInclude(undefined, true) },
  });

  const token = signJWT({ userId, sessionKey });
  return { session, token };
}

/**
 * POST /api/auth -> login
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const { session, token } = await createSession(user.id, req);

    const res = NextResponse.json({
      message: "Logged in successfully",
      user: session.user,
      sessionKey: session.sessionKey,
      sessionData: session,
    });

    setJWTCookie(res, token);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth -> logout
 */
export async function DELETE(req: NextRequest) {
  try {
    const verified = await verifySession(req);
    if (verified) {
      await prisma.sessionData.updateMany({
        where: {
          userId: verified.user.id,
          sessionKey: verified.session.sessionKey,
        },
        data: { expiresAt: new Date() },
      });
    }

    const res = NextResponse.json({ message: "Logged out successfully" });
    res.cookies.set("token", "", { maxAge: -1, path: "/" });
    return res;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/auth -> fetch current session/user
 */
export async function GET(req: NextRequest) {
  try {
    const verified = await verifySession(req);
    if (!verified)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({
      user: verified.user,
      sessionKey: verified.session.sessionKey,
      sessionData: verified.session,
    });
  } catch (err) {
    console.error("Fetch session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
