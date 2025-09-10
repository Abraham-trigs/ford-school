import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let classes;
  if (["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    classes = await prisma.class.findMany({ include: { teacher: true, students: true } });
  } else if (sessionUser.role === "TEACHER") {
    classes = await prisma.class.findMany({
      where: { teacherId: sessionUser.id },
      include: { teacher: true, students: true },
    });
  } else {
    classes = await prisma.class.findMany({
      where: { students: { some: { id: sessionUser.id } } },
      include: { teacher: true, students: true },
    });
  }

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, teacherId } = body;

  const newClass = await prisma.class.create({
    data: {
      name,
      teacherId,
    },
  });

  return NextResponse.json(newClass, { status: 201 });
}
