// app/api/sessions/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      console.warn("⚠️ No token cookie found in request");
      return NextResponse.json({ user: null });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn("❌ Invalid or expired token:", err);
      return NextResponse.json({ user: null });
    }

    // ✅ Fetch only base user and memberships
    const baseUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { memberships: true },
    });

    if (!baseUser) {
      console.warn("⚠️ No user found for token payload:", payload);
      return NextResponse.json({ user: null });
    }

    const primaryRole =
      baseUser.memberships[0]?.role || payload.role || "GUEST";

    let roleProfile: any = null;

    // ✅ Fetch role-specific profile only (no redundant queries)
    switch (primaryRole) {
      case "SUPERADMIN":
        roleProfile = await prisma.superAdminProfile.findUnique({
          where: { userId: baseUser.id },
        });
        break;

      case "TEACHER":
        roleProfile = await prisma.teacherProfile.findUnique({
          where: { userId: baseUser.id },
        });
        break;

      case "STUDENT":
        roleProfile = await prisma.studentProfile.findUnique({
          where: { userId: baseUser.id },
        });
        break;

      case "PARENT":
        roleProfile = await prisma.parentProfile.findUnique({
          where: { userId: baseUser.id },
        });
        break;

      case "STAFF":
        roleProfile = await prisma.staffProfile.findUnique({
          where: { userId: baseUser.id },
        });
        break;

      default:
        roleProfile = null;
    }

    // ✅ Unified profile response (consistent structure)
    const profile = {
      id: baseUser.id,
      email: baseUser.email,
      fullName: baseUser.fullName,
      profilePicture: baseUser.profilePicture,
      roles: baseUser.memberships.map((m) => m.role),
      memberships: baseUser.memberships.map((m) => ({
        id: m.id,
        role: m.role,
      })),
      primaryRole,
      roleProfile: roleProfile
        ? {
            ...roleProfile,
            createdAt: roleProfile.createdAt?.toISOString?.(),
            updatedAt: roleProfile.updatedAt?.toISOString?.(),
          }
        : undefined,
    };

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("❌ Unexpected /sessions/profile error:", err);
    return NextResponse.json({ user: null });
  }
}
