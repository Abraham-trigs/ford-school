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

// --- Role check ---
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

// --- GET /api/classrooms/:id ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    if (isNaN(classroomId)) return NextResponse.json({ error: "Invalid classroom ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { students: true, schoolSession: true },
    });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ data: classroom });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- PUT /api/classrooms/:id ---
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    if (isNaN(classroomId)) return NextResponse.json({ error: "Invalid classroom ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, grade } = await req.json();

    const updated = await prisma.classroom.update({
      where: { id: classroomId },
      data: { name, grade },
      include: { students: true, schoolSession: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- DELETE /api/classrooms/:id ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const classroomId = parseInt(params.id);
    if (isNaN(classroomId)) return NextResponse.json({ error: "Invalid classroom ID" }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.deletedAt) return NextResponse.json({ error: "Classroom not found" }, { status: 404 });

    if (!(await canManageClassroom(userId, roles, classroom.schoolSessionId)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.classroom.update({
      where: { id: classroomId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
