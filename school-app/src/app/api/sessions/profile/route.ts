// app/api/sessions/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // 🧠 Debug incoming cookies
    console.log("🍪 Incoming cookies:", req.cookies.getAll());

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

    // ✅ fallback role must be inside GET, after token is verified
    const fallbackRole = payload.role ? [payload.role] : [];

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        staffProfile: true,
        superAdminProfile: true, // ✅ keep this only
      },
    });

    if (!user) {
      console.warn("⚠️ No user found for token payload:", payload);
      return NextResponse.json({ user: null });
    }

    const profile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      roles: user.memberships.length
        ? user.memberships.map((m) => m.role)
        : fallbackRole,
      memberships: user.memberships.map((m) => ({ id: m.id, role: m.role })),
      studentProfile: user.studentProfile ?? undefined,
      teacherProfile: user.teacherProfile ?? undefined,
      parentProfile: user.parentProfile ?? undefined,
      staffProfile: user.staffProfile ?? undefined,
      // ✅ simplified: only rely on superAdminProfile
      superAdminProfile: user.superAdminProfile
        ? {
            id: user.superAdminProfile.id,
            title: user.superAdminProfile.title,
            bio: user.superAdminProfile.bio,
            avatar: user.superAdminProfile.avatar,
            department: user.superAdminProfile.department,
            createdAt: user.superAdminProfile.createdAt.toISOString(),
            updatedAt: user.superAdminProfile.updatedAt.toISOString(),
          }
        : undefined,
    };

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("❌ Unexpected profile route error:", err);
    return NextResponse.json({ user: null });
  }
}
