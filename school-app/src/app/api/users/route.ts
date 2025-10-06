// /api/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const staffRoles = [
  "FINANCE","HR","RECEPTIONIST","IT_SUPPORT","TRANSPORT",
  "NURSE","COOK","CLEANER","SECURITY","MAINTENANCE"
];

// Zod schemas
const getQuerySchema = z.object({
  role: z.enum(staffRoles).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().regex(/^\d+$/).optional(),
});

const postBodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  profilePicture: z.string().url().optional(),
  role: z.enum(staffRoles),
  schoolSessionId: z.string().uuid(),
  profileData: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const { roles, userId } = payload;

    const url = new URL(req.url);
    const query = getQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const { role: roleFilter, page = "1", pageSize = "20" } = query;

    const where: any = { role: { in: staffRoles } };
    if (roleFilter) where.role = roleFilter;

    // Restrict to active sessions for non-SUPERADMIN
    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      const allowedIds = memberships.map(m => m.schoolSessionId);
      where.memberships = { some: { schoolSessionId: { in: allowedIds }, active: true } };
    }

    const staff = await prisma.staffProfile.findMany({
      where,
      include: { user: true, memberships: { include: { schoolSession: true } } },
      skip: (parseInt(page)-1)*parseInt(pageSize),
      take: parseInt(pageSize),
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: staff, meta: { page: parseInt(page), pageSize: parseInt(pageSize) } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err instanceof z.ZodError ? err.errors : err.message || "Internal server error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const { roles, userId: requesterId } = payload;

    const body = postBodySchema.parse(await req.json());
    const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = body;

    // Check management rights
    const isAdmin = roles.includes("SUPERADMIN") || await prisma.userSchoolSession.findFirst({
      where: { userId: requesterId, schoolSessionId, active: true },
    });
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const hashed = await bcrypt.hash(password, 12);

    const staffUser = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, fullName, profilePicture } });

      await tx.userSchoolSession.create({
        data: { userId: user.id, email, password: hashed, role, schoolSessionId, active: true },
      });

      await tx.staffProfile.create({ data: { ...profileData, userId: user.id } });
      return user;
    });

    const created = await prisma.staffProfile.findFirst({
      where: { userId: staffUser.id },
      include: { user: true, memberships: { include: { schoolSession: true } } },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err instanceof z.ZodError ? err.errors : err.message || "Internal server error" }, { status: 400 });
  }
}
