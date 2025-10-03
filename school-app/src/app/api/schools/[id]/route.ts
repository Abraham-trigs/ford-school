import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN"];

// Zod schema for PUT
const updateSchoolSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET /api/schools/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles, userId } = authenticate(req);
    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) return NextResponse.json({ error: "Invalid school ID" }, { status: 400 });

    if (!roles.includes("SUPERADMIN")) {
      const membership = await prisma.userSchoolSession.findFirst({
        where: { userId, schoolSessionId: schoolId, active: true },
      });
      if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const school = await prisma.schoolSession.findUnique({ where: { id: schoolId } });
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

    return NextResponse.json({ data: school });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/schools/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) return NextResponse.json({ error: "Invalid school ID" }, { status: 400 });

    const body = await req.json();
    const parseResult = updateSchoolSchema.safeParse(body);
    if (!parseResult.success)
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { name, address, startDate, endDate } = parseResult.data;
    const updatedSchool = await prisma.schoolSession.update({
      where: { id: schoolId },
      data: {
        name,
        address,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return NextResponse.json({ data: updatedSchool });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/schools/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles } = authenticate(req);
    if (!roles.includes("SUPERADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) return NextResponse.json({ error: "Invalid school ID" }, { status: 400 });

    const deletedSchool = await prisma.schoolSession.update({
      where: { id: schoolId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deletedSchool.id, deletedAt: deletedSchool.deletedAt } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
