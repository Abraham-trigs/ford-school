import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtFromHeader } from "@/lib/auth";

/**
 * GET /api/users/[id]
 * - SuperAdmin/Admin/Secretary/Accountant/Librarian: can fetch any user
 * - Teacher: only students in their assigned section (TODO)
 * - Counselor / Nurse: only assigned students (TODO)
 * - Student: only self
 * - Parent: only their children (TODO)
 * - Cleaner/Janitor/Cook/KitchenAssistant: no access
 *
 * PUT /api/users/[id]
 * - SuperAdmin/Admin: can update any user
 * - Student: can update own profile
 * - All others: forbidden
 *
 * DELETE /api/users/[id]
 * - SuperAdmin/Admin: can delete any user
 * - All others: forbidden
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    switch (caller.role) {
      case "SUPERADMIN":
      case "ADMIN":
      case "SECRETARY":
      case "ACCOUNTANT":
      case "LIBRARIAN":
        // ✅ can fetch any user
        break;

      case "TEACHER":
        // ⚠️ TODO: validate that this user is a student in teacher’s section
        return NextResponse.json({ error: "Teachers can only view assigned students (not implemented)" }, { status: 403 });

      case "COUNSELOR":
      case "NURSE":
        // ⚠️ TODO: validate that this user is one of counselor’s/nurse’s assigned students
        return NextResponse.json({ error: `${caller.role} can only view assigned students (not implemented)` }, { status: 403 });

      case "STUDENT":
        if (caller.userId !== id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        break;

      case "PARENT":
        // ⚠️ TODO: validate that this user is one of the parent’s children
        return NextResponse.json({ error: "Parents can only view own children (not implemented)" }, { status: 403 });

      case "CLEANER":
      case "JANITOR":
      case "COOK":
      case "KITCHEN_ASSISTANT":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      default:
        return NextResponse.json({ error: "Role not recognized" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    // SUPERADMIN and ADMIN can update anyone
    if (["SUPERADMIN", "ADMIN"].includes(caller.role)) {
      const updated = await prisma.user.update({ where: { id }, data: body });
      return NextResponse.json(updated);
    }

    // STUDENT can only update self
    if (caller.role === "STUDENT" && caller.userId === id) {
      const updated = await prisma.user.update({ where: { id }, data: body });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["SUPERADMIN", "ADMIN"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
