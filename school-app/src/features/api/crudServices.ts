// src/features/api/crudService.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

// Generic multi-tenant CRUD handler
export function createCRUDHandler<T extends object>({
  model,
  schema,
  allowedRoles,
  resourceName,
}: {
  model: any; // Prisma model
  schema: ZodSchema<T>;
  allowedRoles: string[];
  resourceName: string;
}) {
  return async function handler(req: NextRequest, user: { id: string; role: string; schoolId: string }) {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
      switch (req.method) {
        case "GET": {
          const items = await model.findMany({ where: { schoolId: user.schoolId } });
          return NextResponse.json(items);
        }

        case "POST": {
          const body = await req.json();
          const validated = schema.parse(body);
          const created = await model.create({ data: { ...validated, schoolId: user.schoolId } });
          return NextResponse.json(created);
        }

        case "PUT":
        case "PATCH": {
          const body = await req.json();
          const validated = schema.parse(body);
          if (!validated.id) throw new Error("Missing id");
          const updated = await model.update({
            where: { id: validated.id },
            data: { ...validated },
          });
          return NextResponse.json(updated);
        }

        case "DELETE": {
          const { searchParams } = new URL(req.url);
          const id = searchParams.get("id");
          if (!id) throw new Error("Missing id");
          await model.delete({ where: { id } });
          return NextResponse.json({ message: `${resourceName} deleted` });
        }

        default:
          return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
      }
    } catch (err: any) {
      return NextResponse.json({ message: err.message || "Error" }, { status: 400 });
    }
  };
}
