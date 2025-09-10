import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth";

// List users (role-based visibility)
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let users;
  if (["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    users = await prisma.user.findMany({ include: { class: true } });
  } else if (sessionUser.role === "TEACHER") {
    users = await prisma.user.findMany({
      where: { class: { teacherId: sessionUser.id } },
      include: { class: true },
    });
  } else {
    users = [await prisma.user.findUnique({ where: { id: sessionUser.id }, include: { class: true } })];
  }

  return NextResponse.json(users);
}

// Create new user (restricted)
export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role, phone, dob, gender, photoUrl } = body;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      dob: dob ? new Date(dob) : null,
      gender,
      photoUrl,
    },
  });

  return NextResponse.json(newUser, { status: 201 });
}
