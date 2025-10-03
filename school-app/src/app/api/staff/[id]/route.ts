import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const staffId = parseInt(params.id);
    if (isNaN(staffId)) return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });

    const staff = await prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: { user: { include: { memberships: true } } },
    });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    return NextResponse.json({ data: staff });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const staffId = parseInt(params.id);
    const body = await req.json();
    const { fullName, profilePicture, profileData } = body;

    const staff = await prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: { user: { include: { memberships: true } } },
    });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    // Check rights
    const schoolSessionId = staff.user.memberships[0].schoolSessionId;
    const canManage = payload.roles.includes("SUPERADMIN") || await prisma.userSchoolSession.findFirst({
      where: { userId: payload.userId, schoolSessionId, active: true },
    });
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.staffProfile.update({
      where: { id: staffId },
      data: {
        ...profileData,
        user: { update: { fullName: fullName ?? staff.user.fullName, profilePicture: profilePicture ?? staff.user.profilePicture } },
      },
      include: { user: true, memberships: { include: { schoolSession: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const staffId = parseInt(params.id);

    const staff = await prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: { user: { include: { memberships: true } } },
    });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const schoolSessionId = staff.user.memberships[0].schoolSessionId;
    const canManage = payload.roles.includes("SUPERADMIN") || await prisma.userSchoolSession.findFirst({
      where: { userId: payload.userId, schoolSessionId, active: true },
    });
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.user.update({ where: { id: staff.userId }, data: { deletedAt: new Date() } });
    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
