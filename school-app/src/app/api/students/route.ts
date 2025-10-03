import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const allowedRoles = ["SUPERADMIN", "ADMIN"];

// Zod schema for POST
const createStudentSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  password: z.string().min(6),
  classroomId: z.number(),
  schoolSessionId: z.number(),
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

export async function GET(req: NextRequest) {
  try {
    const { roles, userId } = authenticate(req);

    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId") ? parseInt(url.searchParams.get("classroomId")!) : undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };
    if (classroomId) whereClause.classroomId = classroomId;

    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({ where: { userId, active: true }, select: { schoolSessionId: true } });
      const allowedIds = memberships.map(m => m.schoolSessionId);
      whereClause.memberships = { some: { schoolSessionId: { in: allowedIds }, active: true } };
    }

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: { user: true, classroom: true, parents: { include: { user: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: students, meta: { page, pageSize } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { roles, userId: requesterId } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parseResult = createStudentSchema.safeParse(body);
    if (!parseResult.success) return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { email, fullName, password, classroomId, profileData, schoolSessionId } = parseResult.data;
    const canManage = await canManageStudent(requesterId, roles, schoolSessionId);
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newStudent = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, fullName } });
      await tx.userSchoolSession.create({ data: { userId: user.id, email, password: hashedPassword, role: "STUDENT", schoolSessionId, active: true } });
      await tx.studentProfile.create({ data: { ...profileData, userId: user.id, classroomId } });
      return user;
    });

    const createdStudent = await prisma.studentProfile.findFirst({
      where: { userId: newStudent.id },
      include: { user: true, classroom: true, parents: { include: { user: true } } },
    });

    return NextResponse.json({ data: createdStudent }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
