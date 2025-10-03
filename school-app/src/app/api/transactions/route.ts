import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN", "FINANCE"];

// Zod schema for POST
const createTransactionSchema = z.object({
  description: z.string(),
  amount: z.number(),
  payments: z.array(z.object({ amount: z.number(), method: z.string() })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    authenticate(req, allowedRoles);

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const transactions = await prisma.transaction.findMany({
      where: search ? { description: { contains: search, mode: "insensitive" }, deletedAt: null } : { deletedAt: null },
      include: { payments: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: transactions, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = authenticate(req, allowedRoles);

    const body = await req.json();
    const parseResult = createTransactionSchema.safeParse(body);
    if (!parseResult.success) return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { description, amount, payments } = parseResult.data;

    const createdTransaction = await prisma.$transaction(async tx => {
      const transaction = await tx.transaction.create({ data: { description, amount, createdById: userId } });

      if (Array.isArray(payments) && payments.length > 0) {
        await Promise.all(payments.map(p => tx.payment.create({ data: { ...p, transactionId: transaction.id } })));
      }

      return transaction;
    });

    const transactionWithPayments = await prisma.transaction.findUnique({
      where: { id: createdTransaction.id },
      include: { payments: true },
    });

    return NextResponse.json({ data: transactionWithPayments }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
