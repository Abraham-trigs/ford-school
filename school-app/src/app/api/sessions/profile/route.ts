// app/api/sessions/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        staffProfile: true,
        superAdminMeta: { include: { profile: true } },
        superAdminProfile: true,
      },
    });

    if (!user) return NextResponse.json({ user: null });

    const profile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      roles: user.memberships.map((m) => m.role),
      memberships: user.memberships.map((m) => ({ id: m.id, role: m.role })),
      studentProfile: user.studentProfile ?? undefined,
      teacherProfile: user.teacherProfile ?? undefined,
      parentProfile: user.parentProfile ?? undefined,
      staffProfile: user.staffProfile ?? undefined,
      superAdminProfile: user.superAdminMeta?.profile
        ? {
            id: user.superAdminMeta.profile.id,
            title: user.superAdminMeta.profile.title,
            bio: user.superAdminMeta.profile.bio,
            avatar: user.superAdminMeta.profile.avatar,
            department: user.superAdminMeta.profile.department,
            createdAt: user.superAdminMeta.profile.createdAt.toISOString(),
            updatedAt: user.superAdminMeta.profile.updatedAt.toISOString(),
          }
        : user.superAdminProfile
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
    console.error(err);
    return NextResponse.json({ user: null });
  }
}
