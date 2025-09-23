import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, errorResponse, hashPassword, findUserById, Caller } from "@/lib/apiHelpers";
import { Role  } from "@/types/school";

// ---------------- GET /api/users/:id ----------------
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const caller: Caller | null = await authenticate(req);
    if (!caller) return errorResponse("Unauthorized", 401);

    const { id } = params;
    const user = await findUserById(id);
    if (!user) return errorResponse("User not found", 404);

    // Role-specific access
    switch (caller.role) {
      case Role.STUDENT:
        if (caller.id !== id) return errorResponse("Forbidden");
        break;
      case Role.PARENT:
        const children = await prisma.student.findMany({
          where: { parents: { some: { id: caller.id } } },
          select: { userId: true },
        });
        if (!children.some((c) => c.userId === id)) return errorResponse("Forbidden");
        break;
      case Role.TEACHER:
        const teacherStudents = await prisma.student.findMany({
          where: { section: { teacherId: caller.id } },
          select: { userId: true },
        });
        if (!teacherStudents.some((s) => s.userId === id)) return errorResponse("Forbidden");
        break;
      case Role.COUNSELOR:
      case Role.NURSE:
        // TODO: assigned students logic
        return errorResponse("Forbidden");
      case Role.SECRETARY:
      case Role.ACCOUNTANT:
      case Role.LIBRARIAN:
      case Role.ADMIN:
      case Role.SUPERADMIN:
        break; // allowed
      default:
        return errorResponse("Forbidden");
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error(err);
    return errorResponse("Server error: " + err.message, 500);
  }
}

// ---------------- PUT /api/users/:id ----------------
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const caller: Caller | null = await authenticate(req);
    if (!caller) return errorResponse("Unauthorized", 401);

    const { id } = params;
    const body = await req.json();
    const targetUser = await findUserById(id);
    if (!targetUser) return errorResponse("User not found", 404);

    // Role-based update
    switch (caller.role) {
      case Role.SUPERADMIN:
        break; // full access
      case Role.ADMIN:
        if (targetUser.role === Role.SUPERADMIN) return errorResponse("Cannot update a SuperAdmin");
        break;
      case Role.STUDENT:
        if (caller.id !== id) return errorResponse("Forbidden");
        delete body.status; // cannot change status
        break;
      case Role.SECRETARY:
      case Role.ACCOUNTANT:
      case Role.LIBRARIAN:
      case Role.TEACHER:
      case Role.PARENT:
        return errorResponse("Forbidden");
      default:
        return errorResponse("Forbidden");
    }

    if (body.password) body.password = await hashPassword(body.password);

    const updated = await prisma.user.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return errorResponse("Server error: " + err.message, 500);
  }
}

// ---------------- DELETE /api/users/:id ----------------
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const caller: Caller | null = await authenticate(req);
    if (!caller) return errorResponse("Unauthorized", 401);
    if (![Role.SUPERADMIN, Role.ADMIN].includes(caller.role)) return errorResponse("Forbidden");

    const { id } = params;
    const targetUser = await findUserById(id);
    if (!targetUser) return errorResponse("User not found", 404);
    if (targetUser.role === Role.SUPERADMIN && caller.role !== Role.SUPERADMIN)
      return errorResponse("Cannot delete a SuperAdmin");

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return errorResponse("Server error: " + err.message, 500);
  }
}
