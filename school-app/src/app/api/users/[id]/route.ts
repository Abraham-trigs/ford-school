import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: { teacher: true, students: true },
  });

  if (!cls) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  if (sessionUser.role === "TEACHER" && cls.teacherId !== sessionUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (sessionUser.role === "STUDENT" && !cls.students.find((s) => s.id === sessionUser.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(cls);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, teacherId } = body;

  const updatedClass = await prisma.class.update({
    where: { id: params.id },
    data: { name, teacherId },
  });

  return NextResponse.json(updatedClass);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.class.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Class deleted successfully" });
}
