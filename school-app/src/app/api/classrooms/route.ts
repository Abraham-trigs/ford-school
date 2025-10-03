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

// --- GET /api/classrooms ---
export async function GET(req: NextRequest) {
  try {
    const { roles, userId } = await verifyToken(req);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const schoolFilter = url.searchParams.get("schoolId");

    let allowedSchoolIds: number[] | undefined;
    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      allowedSchoolIds = memberships.map(m => m.schoolSessionId);
      if (!allowedSchoolIds.length) return NextResponse.json({ data: [], meta: { page, pageSize } });
    }

    const whereClause: any = { deletedAt: null };
    if (schoolFilter) {
      const schoolIdNum = parseInt(schoolFilter);
      if (!isNaN(schoolIdNum)) whereClause.schoolSessionId = schoolIdNum;
    } else if (allowedSchoolIds) {
      whereClause.schoolSessionId = { in: allowedSchoolIds };
    }

    const classrooms = await prisma.classroom.findMany({
      where: whereClause,
      include: { students: true, schoolSession: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: classrooms, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- POST /api/classrooms ---
export async function POST(req: NextRequest) {
  try {
    const { roles, userId } = await verifyToken(req);
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN")) throw { status: 403, message: "Forbidden" };

    const body = await req.json();
    const { name, grade, schoolSessionId } = body;
    if (!name || !schoolSessionId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    if (!roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId, schoolSessionId, active: true },
      });
      if (!membership) return NextResponse.json({ error: "Forbidden: Cannot create classroom in this school" }, { status: 403 });
    }

    const classroom = await prisma.classroom.create({
      data: { name, grade, schoolSessionId },
      include: { students: true, schoolSession: true },
    });

    return NextResponse.json({ data: classroom }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
