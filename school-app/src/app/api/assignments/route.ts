import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";
import { RoleType } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const assignmentIncludes = { course: true, grades: { include: { student: true } } };

// --- JWT helper ---
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" };
  const token = authHeader.split(" ")[1];
  try { return jwt.verify(token, JWT_SECRET) as any; }
  catch { throw { status: 401, message: "Invalid token" }; }
}

// --- Role access ---
async function canManageAssignment(userId: number, RoleType: string[], courseId: number) {
  if (RoleType.includes("SUPERADMIN")) return true;
  if (RoleType.includes("ADMIN")) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { schoolSessionId: true } });
    if (!course) return false;
    const membership = await prisma.userSchoolSession.findFirst({ where: { userId, schoolSessionId: course.schoolSessionId, active: true } });
    return !!membership;
  }
  if (RoleType.includes("TEACHER")) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    return course?.teacherId === userId;
  }
  return false;
}

// --- GET /api/assignments ---
export async function GET(req: NextRequest) {
  try {
    const { RoleType, userId } = await verifyToken(req);
    const url = new URL(req.url);

    const courseId = url.searchParams.get("courseId") ? parseInt(url.searchParams.get("courseId")!) : undefined;
    const courseName = url.searchParams.get("courseName") || undefined;
    const dueDateFrom = url.searchParams.get("dueDateFrom") ? new Date(url.searchParams.get("dueDateFrom")!) : undefined;
    const dueDateTo = url.searchParams.get("dueDateTo") ? new Date(url.searchParams.get("dueDateTo")!) : undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };
    if (courseId) whereClause.courseId = courseId;
    if (dueDateFrom || dueDateTo) whereClause.dueDate = {};
    if (dueDateFrom) whereClause.dueDate.gte = dueDateFrom;
    if (dueDateTo) whereClause.dueDate.lte = dueDateTo;

    if (!RoleType.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({ where: { userId, active: true }, select: { schoolSessionId: true } });
      const allowedSchoolIds = memberships.map(m => m.schoolSessionId);
      if (RoleType.includes("ADMIN")) whereClause.course = { schoolSessionId: { in: allowedSchoolIds } };
      else if (RoleType.includes("TEACHER")) whereClause.course = { teacherId: userId };
    }

    if (courseName) whereClause.course = { ...whereClause.course, name: { contains: courseName, mode: "insensitive" } };

    const total = await prisma.assignment.count({ where: whereClause });

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: assignmentIncludes,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: assignments,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- POST /api/assignments ---
export async function POST(req: NextRequest) {
  try {
    const { RoleType, userId } = await verifyToken(req);
    if (!["SUPERADMIN", "ADMIN", "TEACHER"].some(r => RoleType.includes(r))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, description, dueDate, courseId } = await req.json();
    if (!title || !courseId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    if (!(await canManageAssignment(userId, RoleType, courseId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const assignment = await prisma.assignment.create({
      data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, courseId },
      include: assignmentIncludes,
    });

    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
