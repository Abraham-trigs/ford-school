"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    if (["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          parent: true,
          children: { include: { parent: true } },
          teacherClasses: true,
          classesAttended: true,
        },
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json(user);
    }

    if (sessionUser.role === "TEACHER") {
      const classes = await prisma.class.findMany({
        where: { teacherId: sessionUser.id },
        include: { students: { include: { parent: true } } },
      });
      const students = classes.flatMap((c) => c.students);
      if (sessionUser.id === id) return NextResponse.json(sessionUser);
      const student = students.find((s) => s.id === id);
      if (!student) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json(student);
    }

    if (sessionUser.id === id) return NextResponse.json(sessionUser);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();
    const { name, email, password, role, phone, dob, gender, photoUrl, parentId } = body;

    let canUpdate = ["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role);
    if (!canUpdate && sessionUser.role === "TEACHER") {
      const classes = await prisma.class.findMany({
        where: { teacherId: sessionUser.id },
        include: { students: true },
      });
      const students = classes.flatMap((c) => c.students);
      canUpdate = students.some((s) => s.id === id);
    }
    if (!canUpdate && sessionUser.id === id) canUpdate = true;
    if (!canUpdate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data: any = { name, email, role, phone, dob: dob ? new Date(dob) : undefined, gender, photoUrl, parentId };
    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: { parent: true, children: { include: { parent: true } }, teacherClasses: true },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let canDelete = ["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role);
    if (!canDelete && sessionUser.role === "TEACHER") {
      const classes = await prisma.class.findMany({
        where: { teacherId: sessionUser.id },
        include: { students: true },
      });
      const students = classes.flatMap((c) => c.students);
      canDelete = students.some((s) => s.id === params.id);
    }

    if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
