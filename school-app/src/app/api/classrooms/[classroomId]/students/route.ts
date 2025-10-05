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

// --- GET /api/classrooms/:id/students ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    if (isNaN(classroomId)) return NextResponse.json({ error: "Invalid classroom ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const students = await prisma.student.findMany({
      where: { classroomId, deletedAt: null },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ data: students, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- POST /api/classrooms/:id/students ---
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    if (isNaN(classroomId)) return NextResponse.json({ error: "Invalid classroom ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { fullName, email, enrollmentNumber } = await req.json();
    if (!fullName) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const student = await prisma.student.create({
      data: { fullName, email, enrollmentNumber, classroomId },
    });

    return NextResponse.json({ data: student }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
