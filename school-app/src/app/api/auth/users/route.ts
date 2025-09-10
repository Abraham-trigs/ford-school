import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users → list all users
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users → create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password, // ⚠️ hash this in production
        role: body.role,
        phone: body.phone,
        dob: body.dob ? new Date(body.dob) : null,
        gender: body.gender,
        photoUrl: body.photoUrl,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
