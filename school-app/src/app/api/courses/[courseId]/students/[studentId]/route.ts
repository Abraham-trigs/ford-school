import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer "))
    throw { status: 401, message: "Unauthorized" };

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw { status: 401, message: "Invalid token" };
  }
}

async function syncGraduationRecords(tx: typeof prisma, batchId: number, records: any[]) {
  const recordIds = records.filter(r => r.id).map(r => r.id);
  if (recordIds.length > 0) {
    await tx.graduationRecord.deleteMany({
      where: { batchId, id: { notIn: recordIds } },
    });
  } else {
    await tx.graduationRecord.deleteMany({ where: { batchId } });
  }

  await Promise.all(
    records.map((r: any) =>
      r.id
        ? tx.graduationRecord.update({ where: { id: r.id }, data: { ...r, batchId } })
        : tx.graduationRecord.create({ data: { ...r, batchId } })
    )
  );
}

// GET /api/graduations/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload: any = await verifyToken(req);
    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });

    const batch = await prisma.graduationBatch.findUnique({
      where: { id },
      include: { records: { include: { student: true } } },
    });

    if (!batch || batch.deletedAt)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    return NextResponse.json({ data: batch });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// PUT /api/graduations/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload: any = await verifyToken(req);
    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });

    const { name, year, records } = await req.json();

    await prisma.$transaction(async (tx) => {
      await tx.graduationBatch.update({ where: { id }, data: { name, year } });
      if (Array.isArray(records)) await syncGraduationRecords(tx, id, records);
    });

    const result = await prisma.graduationBatch.findUnique({
      where: { id },
      include: { records: { include: { student: true } } },
    });

    return NextResponse.json({ data: result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// DELETE /api/graduations/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload: any = await verifyToken(req);
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
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
