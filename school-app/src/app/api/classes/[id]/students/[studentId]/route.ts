import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string; studentId: string } }) {
  try {
    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: { students: { disconnect: { id: params.studentId } } },
      include: { students: true, teacher: true },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove student" }, { status: 500 });
  }
}
