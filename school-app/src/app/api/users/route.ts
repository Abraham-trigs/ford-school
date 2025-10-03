import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcrypt";
import { z } from "zod";

const rolesWithSchool = [
  "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "ASSISTANT_TEACHER",
  "COUNSELOR", "LIBRARIAN", "EXAM_OFFICER", "FINANCE", "HR",
  "RECEPTIONIST", "IT_SUPPORT", "TRANSPORT", "NURSE", "COOK",
  "CLEANER", "SECURITY", "MAINTENANCE", "STUDENT", "CLASS_REP", "PARENT",
];

const profileRoles: Record<string, string> = {
  STUDENT: "studentProfile",
  PARENT: "parentProfile",
  TEACHER: "teacherProfile",
  PRINCIPAL: "teacherProfile",
  VICE_PRINCIPAL: "teacherProfile",
  FINANCE: "staffProfile",
  HR: "staffProfile",
  RECEPTIONIST: "staffProfile",
  IT_SUPPORT: "staffProfile",
  TRANSPORT: "staffProfile",
  NURSE: "staffProfile",
  COOK: "staffProfile",
  CLEANER: "staffProfile",
  SECURITY: "staffProfile",
  MAINTENANCE: "staffProfile",
};

const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  password: z.string(),
  profilePicture: z.string().optional(),
  role: z.string(),
  schoolSessionId: z.number().optional(),
  profileData: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const { roles, userId } = payload;

    const url = new URL(req.url);
    const emailFilter = url.searchParams.get("email") || undefined;
    const roleFilter = url.searchParams.get("role") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };

    if (emailFilter) whereClause.email = { contains: emailFilter, mode: "insensitive" };
    if (roleFilter) whereClause.memberships = { some: { role: roleFilter } };

    if (!roles.includes("SUPERADMIN")) {
      const adminMemberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      const allowedSchoolIds = adminMemberships.map(m => m.schoolSessionId);
      whereClause.memberships = {
        some: {
          schoolSessionId: { in: allowedSchoolIds },
          active: true,
          ...(roleFilter ? { role: roleFilter } : {}),
        },
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { 
        memberships: { include: { schoolSession: true } }, 
        studentProfile: true,
        teacherProfile: true,
        staffProfile: true,
        parentProfile: true 
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: users, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN", "ADMIN"]);
    const { roles } = payload;

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors }, { status: 400 });

    const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = parsed.data;

    if (rolesWithSchool.includes(role) && !schoolSessionId) 
      return NextResponse.json({ error: "School session required for this role" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, fullName, profilePicture } });

      if (rolesWithSchool.includes(role)) {
        await tx.userSchoolSession.create({
          data: { userId: user.id, email, password: hashedPassword, role, schoolSessionId, active: true, humanId: `${schoolSessionId}-${email.split("@")[0]}` },
        });
      }

      const profileKey = profileRoles[role];
      if (profileKey && profileData) await tx[profileKey].create({ data: { ...profileData, userId: user.id } });

      return user;
    });

    const createdUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { 
        memberships: { include: { schoolSession: true } }, 
        studentProfile: true,
        teacherProfile: true,
        staffProfile: true,
        parentProfile: true 
      },
    });

    return NextResponse.json({ data: createdUser }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
