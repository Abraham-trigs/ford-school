// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;


export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    // 1️⃣ Fetch the User
    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: true }, // includes UserSchoolSession(s)
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 2️⃣ Pick the active UserSchoolSession (for current login)
    const activeSession = user.memberships.find((s) => s.active);
    if (!activeSession) {
      return NextResponse.json({ message: "No active session for this user" }, { status: 403 });
    }

    // 3️⃣ Compare passwords
    const isValid = await bcrypt.compare(password, activeSession.password);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: activeSession.role,
        schoolSessionId: activeSession.schoolSessionId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Set cookie
    const res = NextResponse.json({ message: "Login successful" });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

