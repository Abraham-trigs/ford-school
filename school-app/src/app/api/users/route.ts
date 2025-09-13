"use server";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET!;

async function getSessionUser(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, SECRET) as {
      id: string;
      email: string;
      role: string;
      name?: string;
    };

    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch {
    return null;
  }
}

const commonInclude = {
  teacherClasses: true,
  classesAttended: true,
  attendanceAsStudent: true,
  attendanceRecorded: true,
};

// ---------------- GET: list users ----------------
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortField = searchParams.get("sort") || "name";
    const sortOrder = searchParams.get("order") === "desc" ? "desc" : "asc";

    if (!["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const whereClause: any = {};
    if (roleFilter) whereClause.role = roleFilter;

    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        ...commonInclude,
        parent: true,
        children: { include: { parent: true, ...commonInclude } },
      },
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
    });

    const total = await prisma.user.count({ where: whereClause });

    return NextResponse.json({ page, limit, total, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- POST: create user ----------------
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, phone, dob, gender, photoUrl, parentId } = body;

    // Validate
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        dob: dob ? new Date(dob) : undefined,
        gender,
        photoUrl,
        parentId: parentId || undefined,
      },
      include: {
        ...commonInclude,
        parent: true,
        children: { include: { parent: true, ...commonInclude } },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
