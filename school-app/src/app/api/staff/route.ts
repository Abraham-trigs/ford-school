import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth"; // centralized JWT + role check
import bcrypt from "bcryptjs";

const staffRoles = [
  "FINANCE","HR","RECEPTIONIST","IT_SUPPORT","TRANSPORT",
  "NURSE","COOK","CLEANER","SECURITY","MAINTENANCE"
];

export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const { roles, userId } = payload;

    const url = new URL(req.url);
    const roleFilter = url.searchParams.get("role");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const where: any = { role: { in: staffRoles } };
    if (roleFilter && staffRoles.includes(roleFilter)) where.role = roleFilter;

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
      skip: (page-1)*pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: staff, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = authenticate(req, ["SUPERADMIN","ADMIN"]);
    const { roles, userId: requesterId } = payload;

    const body = await req.json();
    const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = body;

    if (!email || !fullName || !password || !role || !schoolSessionId)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (!staffRoles.includes(role))
      return NextResponse.json({ error: "Invalid staff role" }, { status: 400 });

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
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
