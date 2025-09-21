import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtFromHeader, requireRoles } from "@/lib/auth";

/**
 * GET /api/users
 * - SuperAdmin: full access
 * - Admin: full access (⚠️ later restrict to department if departments exist)
 * - Secretary: can view all
 * - Accountant / Librarian: read-only (all users)
 * - Teacher: only students in assigned section (TODO)
 * - Counselor / Nurse: only assigned students (TODO)
 * - Student: only self
 * - Parent: only own children (TODO)
 * - Cleaner / Janitor / Cook / KitchenAssistant: no access
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let where: any = {};

    switch (caller.role) {
      case "SUPERADMIN":
      case "ADMIN":
      case "SECRETARY":
      case "ACCOUNTANT":
      case "LIBRARIAN":
        // ✅ can view all users
        where = {};
        break;

      case "TEACHER":
        // ⚠️ TODO: implement filtering by assigned section
        return NextResponse.json({ error: "Teachers can only view assigned students (not implemented)" }, { status: 403 });

      case "COUNSELOR":
      case "NURSE":
        // ⚠️ TODO: implement filtering by assigned students
        return NextResponse.json({ error: `${caller.role} can only view assigned students (not implemented)` }, { status: 403 });

      case "STUDENT":
        // ✅ can only view self
        where = { id: caller.userId };
        break;

      case "PARENT":
        // ⚠️ TODO: implement filtering by own children
        return NextResponse.json({ error: "Parents can only view own children (not implemented)" }, { status: 403 });

      // ❌ No access
      case "CLEANER":
      case "JANITOR":
      case "COOK":
      case "KITCHEN_ASSISTANT":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      default:
        return NextResponse.json({ error: "Role not recognized" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
