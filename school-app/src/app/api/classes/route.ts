import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
      students: true,
      assignments: true,
    },
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cls = await prisma.class.create({ data: body });
  return NextResponse.json(cls);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const updated = await prisma.class.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ message: "Class deleted" });
}
