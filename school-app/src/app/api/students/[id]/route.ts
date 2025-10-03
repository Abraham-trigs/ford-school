import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN"];

// Zod schema for PUT
const updateStudentSchema = z.object({
  fullName: z.string().optional(),
  classroomId: z.number().optional(),
  profileData: z.record(z.any()).optional(),
});

async function canManageStudent(userId: number, roles: string[], schoolSessionId: number) {
  if (roles.includes("SUPERADMIN")) return true;
  if (roles.includes("ADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({ where: { userId, schoolSessionId, active: true } });
    return !!membership;
  }
  return false;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId: requesterId } = authenticate(req);
    const studentId = parseInt(params.id);
    if (isNaN(studentId)) return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: { include: { memberships: true } }, classroom: true, parents: { include: { user: true } } },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const schoolSessionId = student.user.memberships[0]?.schoolSessionId;
    if (!(await canManageStudent(requesterId, roles, schoolSessionId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ data: student });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId: requesterId } = authenticate(req);
    const studentId = parseInt(params.id);
    if (isNaN(studentId)) return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId }, include: { user: { include: { memberships: true } } } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const schoolSessionId = student.user.memberships[0]?.schoolSessionId;
    if (!(await canManageStudent(requesterId, roles, schoolSessionId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parseResult = updateStudentSchema.safeParse(body);
    if (!parseResult.success) return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { fullName, classroomId, profileData } = parseResult.data;

    const updatedStudent = await prisma.studentProfile.update({
      where: { id: studentId },
      data: { ...profileData, classroomId: classroomId ?? student.classroomId, user: fullName ? { update: { fullName } } : undefined },
      include: { user: true, classroom: true, parents: { include: { user: true } } },
    });

    return NextResponse.json({ data: updatedStudent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId: requesterId } = authenticate(req);
    const studentId = parseInt(params.id);
    if (isNaN(studentId)) return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId }, include: { user: { include: { memberships: true } } } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const schoolSessionId = student.user.memberships[0]?.schoolSessionId;
    if (!(await canManageStudent(requesterId, roles, schoolSessionId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.user.update({ where: { id: student.userId }, data: { deletedAt: new Date() } });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
