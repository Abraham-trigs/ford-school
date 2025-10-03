import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const updateParentSchema = z.object({
  fullName: z.string().min(2).optional(),
  profilePicture: z.string().optional(),
  profileData: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
  }).optional(),
  studentIds: z.array(z.number()).optional(),
});

async function canManageParent(userId: number, roles: string[], schoolSessionId: number) {
  if (roles.includes("SUPERADMIN")) return true;
  if (roles.includes("ADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: { userId, schoolSessionId, active: true },
    });
    return !!membership;
  }
  return false;
}

// GET /api/parents/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId: requesterId } = authenticate(req);

    const parentId = parseInt(params.id);
    if (isNaN(parentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const parent = await prisma.parentProfile.findUnique({
      where: { id: parentId },
      include: { user: { include: { memberships: true } }, students: true },
    });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

    const schoolSessionId = parent.user.memberships[0]?.schoolSessionId;
    const canManage = await canManageParent(requesterId, roles, schoolSessionId);
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ data: parent });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/parents/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId: requesterId } = authenticate(req);

    const parentId = parseInt(params.id);
    if (isNaN(parentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const parent = await prisma.parentProfile.findUnique({
      where: { id: parentId },
      include: { user: { include: { memberships: true } }, students: true },
    });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

    const schoolSessionId = parent.user.memberships[0]?.schoolSessionId;
    const canManage = await canManageParent(requesterId, roles, schoolSessionId);
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parseResult = updateParentSchema.safeParse(body);
    if (!parseResult.success) return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { fullName, profilePicture, profileData, studentIds } = parseResult.data;

    if (studentIds?.length) {
      const validStudents = await prisma.student.findMany({ where: { id: { in: studentIds } } });
      if (validStudents.length !== studentIds.length) return NextResponse.json({ error: "Invalid student IDs" }, { status: 400 });
    }

    const updatedParent = await prisma.parentProfile.update({
      where: { id: parentId },
      data: {
        ...profileData,
        studentIds,
        user: {
          update: {
            fullName: fullName ?? parent.user.fullName,
            profilePicture: profilePicture ?? parent.user.profilePicture,
          },
        },
      },
      include: { user: true, students: true, memberships: { include: { schoolSession: true } } },
    });

    return NextResponse.json({ data: updatedParent });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/parents/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId: requesterId } = authenticate(req);

    const parentId = parseInt(params.id);
    if (isNaN(parentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const parent = await prisma.parentProfile.findUnique({
      where: { id: parentId },
      include: { user: { include: { memberships: true } } },
    });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

    const schoolSessionId = parent.user.memberships[0]?.schoolSessionId;
    const canManage = await canManageParent(requesterId, roles, schoolSessionId);
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deletedUser = await prisma.user.update({
      where: { id: parent.userId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deletedUser.id, deletedAt: deletedUser.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
