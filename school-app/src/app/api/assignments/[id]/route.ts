import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const assignmentIncludes = { course: true, grades: { include: { student: true } } };

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" };
  const token = authHeader.split(" ")[1];
  try { return jwt.verify(token, JWT_SECRET) as any; }
  catch { throw { status: 401, message: "Invalid token" }; }
}

async function canManageAssignment(userId: number, roles: string[], courseId: number) {
  if (roles.includes("SUPERADMIN")) return true;
  if (roles.includes("ADMIN")) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { schoolSessionId: true } });
    if (!course) return false;
    const membership = await prisma.userSchoolSession.findFirst({ where: { userId, schoolSessionId: course.schoolSessionId, active: true } });
    return !!membership;
  }
  if (roles.includes("TEACHER")) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    return course?.teacherId === userId;
  }
  return false;
}

// --- GET /api/assignments/:id ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const assignmentId = parseInt(params.id);
    if (isNaN(assignmentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: assignmentIncludes });
    if (!assignment || assignment.deletedAt) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    if (!(await canManageAssignment(userId, roles, assignment.courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ data: assignment });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- PUT /api/assignments/:id ---
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const assignmentId = parseInt(params.id);
    if (isNaN(assignmentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.deletedAt) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    if (!(await canManageAssignment(userId, roles, assignment.courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, description, dueDate } = await req.json();
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: assignmentIncludes,
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- DELETE /api/assignments/:id ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const assignmentId = parseInt(params.id);
    if (isNaN(assignmentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.deletedAt) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    if (!(await canManageAssignment(userId, roles, assignment.courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.assignment.update({ where: { id: assignmentId }, data: { deletedAt: new Date() } });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
