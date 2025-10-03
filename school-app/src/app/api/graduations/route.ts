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

// Helper for syncing graduation records
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

// GET /api/graduations
export async function GET(req: NextRequest) {
  try {
    const payload: any = await verifyToken(req);
    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const batchFilter = url.searchParams.get("batch");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };
    if (batchFilter) whereClause.name = { contains: batchFilter, mode: "insensitive" };

    const batches = await prisma.graduationBatch.findMany({
      where: whereClause,
      include: { records: { include: { student: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { year: "desc" },
    });

    return NextResponse.json({ data: batches, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// POST /api/graduations
export async function POST(req: NextRequest) {
  try {
    const payload: any = await verifyToken(req);
    const { roles } = payload;
    if (!roles.includes("SUPERADMIN") && !roles.includes("ADMIN"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, year, records } = await req.json();
    if (!name || !year)
      return NextResponse.json({ error: "Batch name and year are required" }, { status: 400 });

    const batch = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.graduationBatch.create({ data: { name, year } });

      if (Array.isArray(records) && records.length > 0) {
        await syncGraduationRecords(tx, newBatch.id, records);
      }

      return newBatch;
    });

    const createdBatch = await prisma.graduationBatch.findUnique({
      where: { id: batch.id },
      include: { records: { include: { student: true } } },
    });

    return NextResponse.json({ data: createdBatch }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
