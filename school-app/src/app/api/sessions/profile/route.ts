// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma/prisma";
import { env, AuthPayload } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ user: null }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    let payload: AuthPayload;
    try { payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload; }
    catch { return NextResponse.json({ user: null }, { status: 401 }); }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: true,
        superAdminProfile: true,
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        staffProfile: true,
      },
    });

    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    let primaryProfile = null;
    const primaryRole = user.memberships[0]?.role;
    switch (primaryRole) {
      case "SUPERADMIN": primaryProfile = user.superAdminProfile; break;
      case "TEACHER": primaryProfile = user.teacherProfile; break;
      case "STUDENT": primaryProfile = user.studentProfile; break;
      case "PARENT": primaryProfile = user.parentProfile; break;
      case "STAFF": primaryProfile = user.staffProfile; break;
    }

    return NextResponse.json({ user: { ...user, primaryProfile } });
  } catch (err) {
    console.error("[ProfileRoute] Error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
