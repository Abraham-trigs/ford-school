import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ----------------- GET USERS -----------------
export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      teacherClasses: true,
      children: true,
      taughtStudents: true,
      createdAssignments: true,
      createdAttendance: true,
    },
  });
  return NextResponse.json(users);
}

// ----------------- CREATE USER -----------------
export async function POST(req: NextRequest) {
  const body = await req.json();
  const newUser = await prisma.user.create({ data: body });
  return NextResponse.json(newUser);
}

// ----------------- UPDATE USER -----------------
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });

  return NextResponse.json(updatedUser);
}

// ----------------- DELETE USER -----------------
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "User deleted" });
}
