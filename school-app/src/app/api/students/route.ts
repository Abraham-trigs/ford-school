import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      class: true,
      teacher: true,
      parent: true,
      submissions: true,
      attendance: true,
    },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const student = await prisma.student.create({ data: body });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const updated = await prisma.student.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ message: "Student deleted" });
}
