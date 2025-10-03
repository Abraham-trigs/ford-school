import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// --- JWT helper ---
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" };
  const token = authHeader.split(" ")[1];
  try { return jwt.verify(token, JWT_SECRET) as any; }
  catch { throw { status: 401, message: "Invalid token" }; }
}

// --- RBAC ---
async function canManageClassroom(userId: number, roles: string[], schoolSessionId: number) {
  if (roles.includes("SUPERADMIN")) return true;
  if (roles.includes("ADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: { userId, schoolSessionId, active: true },
    });
    return !!membership;
  }
  return false;
}

// --- GET /api/classrooms/:id/students/:studentId ---
export async function GET(req: NextRequest, { params }: { params: { id: string; studentId: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    const studentId = parseInt(params.studentId);
    if (isNaN(classroomId) || isNaN(studentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.deletedAt || student.classroomId !== classroomId)
      return NextResponse.json({ error: "Student not found in this classroom" }, { status: 404 });

    return NextResponse.json({ data: student });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- PUT /api/classrooms/:id/students/:studentId ---
export async function PUT(req: NextRequest, { params }: { params: { id: string; studentId: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    const studentId = parseInt(params.studentId);
    if (isNaN(classroomId) || isNaN(studentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.deletedAt || student.classroomId !== classroomId)
      return NextResponse.json({ error: "Student not found in this classroom" }, { status: 404 });

    const { fullName, email, enrollmentNumber } = await req.json();

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        fullName: fullName ?? student.fullName,
        email: email ?? student.email,
        enrollmentNumber: enrollmentNumber ?? student.enrollmentNumber,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- DELETE /api/classrooms/:id/students/:studentId ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string; studentId: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    const studentId = parseInt(params.studentId);
    if (isNaN(classroomId) || isNaN(studentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.deletedAt || student.classroomId !== classroomId)
      return NextResponse.json({ error: "Student not found in this classroom" }, { status: 404 });

    const deleted = await prisma.student.update({
      where: { id: studentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
