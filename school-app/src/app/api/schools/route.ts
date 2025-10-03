import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN"];

// Zod schema for POST
const createSchoolSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET /api/schools
export async function GET(req: NextRequest) {
  try {
    const { roles, userId } = authenticate(req);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const whereClause: any = { deletedAt: null };

    if (!roles.includes("SUPERADMIN")) {
      const memberships = await prisma.userSchoolSession.findMany({
        where: { userId, active: true },
        select: { schoolSessionId: true },
      });
      const allowedIds = memberships.map(m => m.schoolSessionId);
      whereClause.id = { in: allowedIds };
    }

    const schools = await prisma.schoolSession.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: schools, meta: { page, pageSize } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/schools
export async function POST(req: NextRequest) {
  try {
    const { roles } = authenticate(req);
    if (!roles.some(r => allowedRoles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parseResult = createSchoolSchema.safeParse(body);
    if (!parseResult.success)
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });

    const { name, address, startDate, endDate } = parseResult.data;
    const school = await prisma.schoolSession.create({
      data: {
        name,
        address,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return NextResponse.json({ data: school }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
