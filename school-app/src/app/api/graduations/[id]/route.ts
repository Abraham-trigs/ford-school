import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET /api/graduations/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });

    const batch = await prisma.graduationBatch.findUnique({
      where: { id },
      include: { records: { include: { student: true } } },
    });

    if (!batch || batch.deletedAt) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    return NextResponse.json({ data: batch });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/graduations/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });

    const { name, year, records } = await req.json();

    const updatedBatch = await prisma.$transaction(async (tx) => {
      const batch = await tx.graduationBatch.update({ where: { id }, data: { name, year } });

      if (Array.isArray(records)) {
        await tx.graduationRecord.deleteMany({ where: { batchId: id } });
        await Promise.all(records.map((r: any) => tx.graduationRecord.create({ data: { ...r, batchId: id } })));
      }

      return batch;
    });

    const result = await prisma.graduationBatch.findUnique({
      where: { id },
      include: { records: { include: { student: true } } },
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/graduations/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });

    const deleted = await prisma.graduationBatch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
