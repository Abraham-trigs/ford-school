// src/features/api/crudServices.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export function createCRUDHandler<T extends object>({
  model,
  schema,
  allowedRoles,
  resourceName,
  onBeforeCreate,
  onAfterMutate,
}: {
  model: any;
  schema: ZodSchema<T>;
  allowedRoles: string[];
  resourceName: string;
  onBeforeCreate?: (data: T, user: any) => Promise<T> | T;
  onAfterMutate?: (record: any, action: "create" | "update" | "delete") => Promise<void> | void;
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
          let validated = schema.parse(body);
          if (onBeforeCreate) validated = await onBeforeCreate(validated, user);
          const created = await model.create({ data: { ...validated, schoolId: user.schoolId } });
          if (onAfterMutate) await onAfterMutate(created, "create");
          return NextResponse.json(created);
        }

        case "PUT":
        case "PATCH": {
          const body = await req.json();
          const validated = schema.parse(body);
          if (!validated.id) throw new Error("Missing id");
          const updated = await model.update({ where: { id: validated.id }, data: validated });
          if (onAfterMutate) await onAfterMutate(updated, "update");
          return NextResponse.json(updated);
        }

        case "DELETE": {
          const { searchParams } = new URL(req.url);
          const id = searchParams.get("id");
          if (!id) throw new Error("Missing id");
          const deleted = await model.delete({ where: { id } });
          if (onAfterMutate) await onAfterMutate(deleted, "delete");
          return NextResponse.json({ message: `${resourceName} deleted` });
        }

        default:
          return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
      }
    } catch (err: any) {
      console.error(`[${resourceName} Error]:`, err);
      return NextResponse.json({ message: err.message || "Internal Error" }, { status: 400 });
    }
  };
}
