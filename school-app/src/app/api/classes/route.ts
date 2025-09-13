import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET!;

// ---------------- Helper: getSessionUser ----------------
async function getSessionUser(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, SECRET) as {
      id: string;
      email: string;
      role: string;
      name?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    return user;
  } catch (err) {
    console.error("Session verification error:", err);
    return null;
  }
}

// ---------------- GET classes ----------------
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let classes;
    if (["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)) {
      classes = await prisma.class.findMany({
        include: {
          teacher: true,
          students: {
            include: { parent: true }, // ✅ include parent
          },
        },
      });
    } else if (sessionUser.role === "TEACHER") {
      classes = await prisma.class.findMany({
        where: { teacherId: sessionUser.id },
        include: {
          teacher: true,
          students: {
            include: { parent: true }, // ✅ include parent
          },
        },
      });
    } else {
      classes = await prisma.class.findMany({
        where: { students: { some: { id: sessionUser.id } } },
        include: {
          teacher: true,
          students: {
            include: { parent: true }, // ✅ include parent
          },
        },
      });
    }

    return NextResponse.json(classes);
  } catch (err) {
    console.error("GET /api/classes error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- POST class ----------------
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (
      !sessionUser ||
      !["ADMIN", "HEADMASTER", "PROPRIETOR"].includes(sessionUser.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, teacherId } = body;

    const newClass = await prisma.class.create({
      data: { name, teacherId },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (err) {
    console.error("POST /api/classes error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
