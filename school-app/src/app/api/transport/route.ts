import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN", "TRANSPORT"];

const createRouteSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  stops: z.array(z.object({ name: z.string(), latitude: z.number(), longitude: z.number() })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    authenticate(req, allowedRoles);

    const url = new URL(req.url);
    const nameFilter = url.searchParams.get("name") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const routes = await prisma.transportRoute.findMany({
      where: nameFilter ? { name: { contains: nameFilter, mode: "insensitive" }, deletedAt: null } : { deletedAt: null },
      include: { stops: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: routes, meta: { page, pageSize } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    authenticate(req, allowedRoles);

    const body = await req.json();
    const parsed = createRouteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors }, { status: 400 });

    const { name, description, stops } = parsed.data;

    const route = await prisma.$transaction(async (tx) => {
      const newRoute = await tx.transportRoute.create({ data: { name, description } });

      if (stops?.length) {
        await Promise.all(stops.map((s) => tx.transportStop.create({ data: { ...s, routeId: newRoute.id } })));
      }

      return newRoute;
    });

    const createdRoute = await prisma.transportRoute.findUnique({ where: { id: route.id }, include: { stops: true } });

    return NextResponse.json({ data: createdRoute }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
