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

// --- Role access ---
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

// --- GET /api/assignments/:id/grades ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const assignmentId = parseInt(params.id);
    if (isNaN(assignmentId)) return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { courseId: true } });
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    if (!(await canManageAssignment(userId, roles, assignment.courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const grades = await prisma.grade.findMany({
      where: { assignmentId, deletedAt: null },
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: grades });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- POST /api/assignments/:id/grades ---
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const assignmentId = parseInt(params.id);
    if (isNaN(assignmentId)) return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { courseId: true } });
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    if (!(await canManageAssignment(userId, roles, assignment.courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { studentId, score, remarks } = await req.json();
    if (!studentId || score == null) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const grade = await prisma.grade.create({
      data: { assignmentId, studentId, score, remarks },
      include: { student: true },
    });

    return NextResponse.json({ data: grade }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
