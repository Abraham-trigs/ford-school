import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        teacher: true,
        students: { include: { parent: true } }, // ✅ include parent
        attendances: true,
      },
    });

    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    return NextResponse.json(cls);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 });
  }
}

// PUT /api/classes/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, teacherId } = await req.json();

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: { name, teacherId },
      include: {
        teacher: true,
        students: { include: { parent: true } }, // ✅ include parent
        attendances: true,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025")
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

// DELETE /api/classes/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.class.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025")
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
