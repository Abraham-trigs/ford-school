import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const allowedRoles = ["SUPERADMIN", "ADMIN", "TRANSPORT"];

const updateRouteSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  stops: z.array(z.object({ name: z.string(), latitude: z.number(), longitude: z.number() })).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    authenticate(req, allowedRoles);

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid route ID" }, { status: 400 });

    const route = await prisma.transportRoute.findUnique({ where: { id }, include: { stops: true } });
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

    return NextResponse.json({ data: route });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    authenticate(req, allowedRoles);

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid route ID" }, { status: 400 });

    const body = await req.json();
    const parsed = updateRouteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors }, { status: 400 });

    const { name, description, stops } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.transportRoute.update({ where: { id }, data: { name, description } });

      if (stops) {
        await tx.transportStop.deleteMany({ where: { routeId: id } });
        await Promise.all(stops.map((s) => tx.transportStop.create({ data: { ...s, routeId: id } })));
      }

      return tx.transportRoute.findUnique({ where: { id }, include: { stops: true } });
    });

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
    if (isNaN(id)) return NextResponse.json({ error: "Invalid route ID" }, { status: 400 });

    const deleted = await prisma.transportRoute.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
