import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN", "FINANCE"];

// Zod schema for POST
const createResourceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unitPrice: z.number().min(0),
});

// GET /api/resources
export async function GET(req: NextRequest) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const nameFilter = url.searchParams.get("name") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const resources = await prisma.resource.findMany({
      where: { deletedAt: null, name: nameFilter ? { contains: nameFilter, mode: "insensitive" } : undefined },
      include: { purchases: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: resources, meta: { page, pageSize } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/resources
export async function POST(req: NextRequest) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parseResult = createResourceSchema.safeParse(body);
    if (!parseResult.success)
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const resource = await prisma.resource.create({ data: parseResult.data });
    return NextResponse.json({ data: resource }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
