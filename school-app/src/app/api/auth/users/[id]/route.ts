import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/users/:id → get user details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/users/:id → update user info
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updateData: any = { ...body };

    // hash password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    } else {
      delete updateData.password;
    }

    if (body.dob) {
      updateData.dob = new Date(body.dob);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    const { password, ...safeUser } = updatedUser;
    return NextResponse.json(safeUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users/:id → delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
