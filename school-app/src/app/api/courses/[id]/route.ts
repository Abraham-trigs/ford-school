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
async function canManageCourse(userId: number, roles: string[], courseId: number) {
  if (roles.includes("SUPERADMIN")) return true;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return false;

  if (roles.includes("ADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: { userId, schoolSessionId: course.schoolSessionId, active: true },
    });
    return !!membership;
  }

  if (["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"].some(r => roles.includes(r))) {
    return course.teacherId === userId;
  }

  return false;
}

// --- GET /api/courses/:id ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const courseId = parseInt(params.id);
    if (isNaN(courseId)) return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { students: true, teacher: true, assignments: true, schoolSession: true },
    });
    if (!course || course.deletedAt) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (!(await canManageCourse(userId, roles, courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ data: course });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- PUT /api/courses/:id ---
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const courseId = parseInt(params.id);
    if (isNaN(courseId)) return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.deletedAt) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (!(await canManageCourse(userId, roles, courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, description, teacherId } = await req.json();

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { name, description, teacherId },
      include: { students: true, teacher: true, assignments: true, schoolSession: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- DELETE /api/courses/:id ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = await verifyToken(req);
    const courseId = parseInt(params.id);
    if (isNaN(courseId)) return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.deletedAt) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (!(await canManageCourse(userId, roles, courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
