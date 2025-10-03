import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN", "FINANCE"];

// Zod schema for PUT
const updateResourceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  unitPrice: z.number().min(0).optional(),
});

// GET /api/resources/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 });

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { purchases: true },
    });
    if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    return NextResponse.json({ data: resource });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/resources/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 });

    const body = await req.json();
    const parseResult = updateResourceSchema.safeParse(body);
    if (!parseResult.success)
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const updated = await prisma.resource.update({ where: { id }, data: parseResult.data });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resources/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 });

    const deleted = await prisma.resource.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
