// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma/prisma";


export async function GET(req: Request) {
  const token = req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload !== "object") throw new Error("Invalid token");

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
