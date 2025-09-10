import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { studentIds } = await req.json();
    if (!studentIds || !Array.isArray(studentIds)) return NextResponse.json({ error: "studentIds array required" }, { status: 400 });

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: { students: { connect: studentIds.map((id: string) => ({ id })) } },
      include: { students: true, teacher: true },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add students" }, { status: 500 });
  }
}
