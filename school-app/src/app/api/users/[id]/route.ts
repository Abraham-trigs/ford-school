// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtFromHeader } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * Users API – handles creation, reading, updating, and deleting users
 * Roles are strictly enforced based on SuperAdmin matrix
 */

// ---------------- POST /api/users ----------------
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, password, phone, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Role-based permission check
    switch (caller.role) {
      case "SUPERADMIN":
        // ✅ can create any role
        break;
      case "ADMIN":
        // ✅ can create staff/students/parents
        if (["SUPERADMIN"].includes(role)) {
          return NextResponse.json({ error: "Admins cannot create SuperAdmins" }, { status: 403 });
        }
        break;
      case "SECRETARY":
        // ✅ can create students + parents only
        if (!["STUDENT", "PARENT"].includes(role)) {
          return NextResponse.json({ error: "Secretaries can only create students or parents" }, { status: 403 });
        }
        break;
      // ❌ no creation access
      case "ACCOUNTANT":
      case "LIBRARIAN":
      case "TEACHER":
      case "COUNSELOR":
      case "NURSE":
      case "STUDENT":
      case "PARENT":
      case "CLEANER":
      case "JANITOR":
      case "COOK":
      case "KITCHEN_ASSISTANT":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      default:
        return NextResponse.json({ error: "Role not recognized" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, phone, role, password: hashedPassword, status: "ACTIVE" },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

// ---------------- GET /api/users/[id] ----------------
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
        if (caller.userId !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

// ---------------- PUT /api/users/[id] ----------------
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

// ---------------- DELETE /api/users/[id] ----------------
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["SUPERADMIN", "ADMIN"].includes(caller.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = params;

    // ⚠️ Optional: prevent deletion of SuperAdmin by non-SuperAdmin
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (targetUser.role === "SUPERADMIN" && caller.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Cannot delete a SuperAdmin" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
