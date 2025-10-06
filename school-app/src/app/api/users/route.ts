import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcrypt";
import { z } from "zod";

/* ------------------------- Types ------------------------- */
interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages?: number;
  };
}

/* ------------------------- Roles & Profiles ------------------------- */
const rolesWithSchool: string[] = [
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
  SUPERADMIN: "superAdminMeta",
};

/* ------------------------- Zod Schema ------------------------- */
const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  profilePicture: z.string().optional(),
  role: z.enum([...Object.keys(profileRoles)] as [string, ...string[]]),
  schoolSessionId: z.number().optional(),
  profileData: z.record(z.any()).optional(),
});

/* ------------------------- GET Handler ------------------------- */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });

    const { roles, userId } = authenticate(req, ["SUPERADMIN", "ADMIN"]);

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const roleFilter = url.searchParams.get("role") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      const allowedSchoolIds = memberships.map(m => m.schoolSessionId);
      whereClause.memberships = { some: { schoolSessionId: { in: allowedSchoolIds }, active: true, ...(roleFilter ? { role: roleFilter } : {}) } };
    } else if (roleFilter) {
      whereClause.memberships = { some: { role: roleFilter } };
    }

    const includeRelations: any = { memberships: { include: { schoolSession: true } }, superAdminMeta: true };
    if (roleFilter === "STUDENT") includeRelations.studentProfile = true;
    if (roleFilter === "PARENT") includeRelations.parentProfile = true;
    if (["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"].includes(roleFilter || "")) includeRelations.teacherProfile = true;
    if (!roleFilter || !["STUDENT", "PARENT", "TEACHER"].includes(roleFilter)) includeRelations.staffProfile = true;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: includeRelations,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: users,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err: any) {
    console.error("❌ GET /api/users error:", err);
    const status = err.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: err.message || "Failed to fetch users." }, { status });
  }
}

/* ------------------------- POST Handler ------------------------- */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });

    const { roles, userId } = authenticate(req, ["SUPERADMIN", "ADMIN"]);

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = parsed.data;

    if (rolesWithSchool.includes(role) && !schoolSessionId)
      return NextResponse.json({ error: "School session is required for this role" }, { status: 400 });

    if (!roles.includes("SUPERADMIN") && rolesWithSchool.includes(role)) {
      const membership = await prisma.userSchoolSession.findFirst({ where: { userId, schoolSessionId, active: true } });
      if (!membership) return NextResponse.json({ error: "No permission for this session" }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, fullName, profilePicture } });

      if (rolesWithSchool.includes(role)) {
        await tx.userSchoolSession.create({
          data: { userId: user.id, email, password: hashedPassword, role, schoolSessionId, active: true, humanId: `${schoolSessionId}-${email.split("@")[0]}` },
        });
      }

      const profileKey = profileRoles[role];
      if (profileKey) {
        if (role === "SUPERADMIN") await tx.superAdmin.create({ data: { userId: user.id, metadata: profileData || {} } });
        else if (profileData) await tx[profileKey].create({ data: { ...profileData, userId: user.id } });
      }

      return user;
    });

    const createdUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { memberships: { include: { schoolSession: true } }, studentProfile: true, teacherProfile: true, staffProfile: true, parentProfile: true, superAdminMeta: true },
    });

    return NextResponse.json({ data: createdUser }, { status: 201 });
  } catch (err: any) {
    console.error("❌ POST /api/users error:", err);
    const status = err.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: err.message || "Failed to create user." }, { status });
  }
}
