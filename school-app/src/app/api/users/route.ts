// File: /app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  authenticate,
  errorResponse,
  hashPassword,
  Caller,
  getUsersForCaller,
} from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client"; // ✅ Correct import from Prisma

// ---------------- POST /api/users ----------------
export async function POST(req: NextRequest) {
  try {
    const caller: Caller | null = await authenticate(req);
    if (!caller) return errorResponse("Unauthorized", 401);

    const { name, email, password, phone, role, status } = await req.json();
    if (!name || !email || !password || !role) {
      return errorResponse("Missing required fields", 400);
    }

    // Role-based creation rules
    switch (caller.role) {
      case Role.SUPERADMIN:
        break; // can create anyone
      case Role.ADMIN:
        if (role === Role.SUPERADMIN) {
          return errorResponse("Admins cannot create SuperAdmins", 403);
        }
        break;
      case Role.SECRETARY:
        if (![Role.STUDENT, Role.PARENT].includes(role as Role)) {
          return errorResponse("Secretaries can only create students or parents", 403);
        }
        break;
      default:
        return errorResponse("Forbidden", 403);
    }

    const hashed = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        password: hashed,
        status: status ?? UserStatus.ACTIVE, // ✅ No casting needed
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
    console.error("POST /api/users error:", err);
    return errorResponse("Server error: " + err.message, 500);
  }
}

// ---------------- GET /api/users ----------------
export async function GET(req: NextRequest) {
  try {
    const caller: Caller | null = await authenticate(req);
    if (!caller) return errorResponse("Unauthorized", 401);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const roleFilter = url.searchParams.get("roles")?.split(",") || undefined;
    const idFilter = url.searchParams.get("ids")?.split(",") || undefined;

    // Base dataset respecting caller's role
    let users = await getUsersForCaller(caller);

    // Apply filters
    if (roleFilter?.length) {
      users = users.filter((u) => roleFilter.includes(u.role));
    }
    if (idFilter?.length) {
      users = users.filter((u) => idFilter.includes(u.id));
    }
    if (search) {
      const s = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phone?.toLowerCase().includes(s),
      );
    }

    // Pagination
    const total = users.length;
    const start = (page - 1) * limit;
    const paginated = users.slice(start, start + limit);

    return NextResponse.json({
      users: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    return errorResponse("Server error: " + err.message, 500);
  }
}
