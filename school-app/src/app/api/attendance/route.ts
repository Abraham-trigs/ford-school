import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET!;

// ---------------- Helper to get session user from cookie ----------------
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    return user;
  } catch (err) {
    console.error("Session verification error:", err);
    return null;
  }
}

// ---------------- GET attendance ----------------
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let records;

    if (["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      records = await prisma.attendance.findMany({ include: { student: true, class: true } });
    } else if (sessionUser.role === "TEACHER") {
      const classes = await prisma.class.findMany({
        where: { teacherId: sessionUser.id },
        select: { id: true },
      });
      const classIds = classes.map(c => c.id);

      records = await prisma.attendance.findMany({
        where: { classId: { in: classIds } },
        include: { student: true, class: true },
      });
    } else {
      records = await prisma.attendance.findMany({
        where: { studentId: sessionUser.id },
        include: { student: true, class: true },
      });
    }

    return NextResponse.json(records);
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- POST attendance ----------------
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser || sessionUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, classId, date, status } = body;

    // Validate student
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    // Validate class
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.teacherId !== sessionUser.id) {
      return NextResponse.json({ error: "Invalid class ID or not your class" }, { status: 400 });
    }

    // Create attendance
    const newRecord = await prisma.attendance.create({
      data: { studentId, classId, date: new Date(date), status },
      include: { student: true, class: true },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
