// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtFromHeader } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * POST /api/users
 * - SuperAdmin: can create any user
 * - Admin: can create staff/students/parents (⚠️ later restrict by department)
 * - Secretary: can create students + parents only
 * - Accountant/Librarian: ❌ cannot create
 * - Teacher/Counselor/Nurse/Student/Parent: ❌ cannot create
 * - Service roles (Cleaner, Janitor, Cook, KitchenAssistant): ❌ no access
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const caller = await verifyJwtFromHeader(authHeader);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // role-based permission check
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

    // hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        password: hashedPassword,
        status: "ACTIVE",
      },
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
