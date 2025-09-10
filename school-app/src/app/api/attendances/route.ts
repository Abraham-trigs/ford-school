import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let records;
  if (["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    records = await prisma.attendance.findMany({ include: { student: true, class: true } });
  } else if (sessionUser.role === "TEACHER") {
    records = await prisma.attendance.findMany({
      where: { class: { teacherId: sessionUser.id } },
      include: { student: true, class: true },
    });
  } else {
    records = await prisma.attendance.findMany({
      where: { studentId: sessionUser.id },
      include: { student: true, class: true },
    });
  }

  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { studentId, classId, date, status } = body;

  const newRecord = await prisma.attendance.create({
    data: {
      studentId,
      classId,
      date: new Date(date),
      status,
    },
  });

  return NextResponse.json(newRecord, { status: 201 });
}
