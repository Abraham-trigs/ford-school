"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

async function getSessionUser(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET) as { id: string; role: string };
    return await prisma.user.findUnique({ where: { id: decoded.id } });
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const search = url.searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (sessionUser.role === "TEACHER") {
      const classes = await prisma.class.findMany({
        where: { teacherId: sessionUser.id },
        include: { students: true },
      });
      const studentIds = classes.flatMap((c) => c.students.map((s) => s.id));
      where.id = { in: studentIds };
    }

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { parent: true, teacherClasses: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
