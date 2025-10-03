import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN", "FINANCE"];
const updateTransactionSchema = z.object({
  description: z.string().optional(),
  amount: z.number().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    authenticate(req, allowedRoles);

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });

    const transaction = await prisma.transaction.findUnique({ where: { id }, include: { payments: true } });
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    return NextResponse.json({ data: transaction });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    authenticate(req, allowedRoles);

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });

    const body = await req.json();
    const parseResult = updateTransactionSchema.safeParse(body);
    if (!parseResult.success) return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const updated = await prisma.transaction.update({ where: { id }, data: parseResult.data });
    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    authenticate(req, allowedRoles);

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });

    const deleted = await prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
