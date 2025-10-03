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

// --- GET /api/courses ---
export async function GET(req: NextRequest) {
  try {
    const { roles, userId } = await verifyToken(req);
    const url = new URL(req.url);
    const schoolSessionId = url.searchParams.get("schoolSessionId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };
    if (schoolSessionId) whereClause.schoolSessionId = parseInt(schoolSessionId);

    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      const allowedSchoolIds = memberships.map(m => m.schoolSessionId);
      whereClause.schoolSessionId = { in: allowedSchoolIds };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: { students: true, teacher: true, assignments: true, schoolSession: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: courses, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- POST /api/courses ---
export async function POST(req: NextRequest) {
  try {
    const { roles } = await verifyToken(req);
    if (!["SUPERADMIN", "ADMIN"].some(r => roles.includes(r))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, description, teacherId, schoolSessionId } = body;
    if (!name || !schoolSessionId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const course = await prisma.course.create({
      data: { name, description, teacherId, schoolSessionId },
      include: { students: true, teacher: true, assignments: true, schoolSession: true },
    });

    return NextResponse.json({ data: course }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
