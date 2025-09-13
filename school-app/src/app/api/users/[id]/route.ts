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

    const decoded = jwt.verify(token, SECRET) as { id: string; role: string };
    return await prisma.user.findUnique({ where: { id: decoded.id } });
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

// ---------------- GET: fetch single user ----------------
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    // Role-based access
    if (!["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      if (sessionUser.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ...commonInclude,
        parent: true, // always include parent for students
        children: {
          include: {
            parent: true, // include parent info for children
            ...commonInclude,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- PUT: update user ----------------
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    // Role-based access
    if (!["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      if (sessionUser.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, phone, dob, gender, photoUrl, parentId } = body;

    const data: any = { name, email, role, phone, dob: dob ? new Date(dob) : undefined, gender, photoUrl, parentId };

    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: {
        ...commonInclude,
        parent: true, // include parent for student
        children: {
          include: {
            parent: true, // include parent for children
            ...commonInclude,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- DELETE: delete user ----------------
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
