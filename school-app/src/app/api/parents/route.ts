import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const allowedRoles = ["SUPERADMIN", "ADMIN"];

// Zod schema for POST
const createParentSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(6),
  profilePicture: z.string().optional(),
  schoolSessionId: z.number(),
  profileData: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
  }).optional(),
  studentIds: z.array(z.number()).optional(),
});

async function canManageParent(userId: number, roles: string[], schoolSessionId: number) {
  if (roles.includes("SUPERADMIN")) return true;
  if (roles.includes("ADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: { userId, schoolSessionId, active: true },
    });
    return !!membership;
  }
  return false;
}

// GET /api/parents
export async function GET(req: NextRequest) {
  try {
    const { roles, userId } = authenticate(req);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };

    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      const allowedSchoolIds = memberships.map(m => m.schoolSessionId);
      whereClause.memberships = { some: { schoolSessionId: { in: allowedSchoolIds }, active: true } };
    }

    const [parents, total] = await Promise.all([
      prisma.parentProfile.findMany({
        where: whereClause,
        include: { user: true, students: true, memberships: { include: { schoolSession: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.parentProfile.count({ where: whereClause }),
    ]);

    return NextResponse.json({ data: parents, meta: { page, pageSize, total } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/parents
export async function POST(req: NextRequest) {
  try {
    const { roles, userId: requesterId } = authenticate(req);

    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parseResult = createParentSchema.safeParse(body);
    if (!parseResult.success)
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { email, fullName, password, profilePicture, schoolSessionId, profileData, studentIds } = parseResult.data;

    const canManage = await canManageParent(requesterId, roles, schoolSessionId);
    if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (studentIds?.length) {
      const validStudents = await prisma.student.findMany({ where: { id: { in: studentIds } } });
      if (validStudents.length !== studentIds.length)
        return NextResponse.json({ error: "Invalid student IDs" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newParent = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, fullName, profilePicture } });
      await tx.userSchoolSession.create({
        data: { userId: user.id, email, password: hashedPassword, role: "PARENT", schoolSessionId, active: true }
      });
      await tx.parentProfile.create({ data: { ...profileData, userId: user.id, studentIds } });
      return user;
    });

    const createdParent = await prisma.parentProfile.findFirst({
      where: { userId: newParent.id },
      include: { user: true, students: true, memberships: { include: { schoolSession: true } } },
    });

    return NextResponse.json({ data: createdParent }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
