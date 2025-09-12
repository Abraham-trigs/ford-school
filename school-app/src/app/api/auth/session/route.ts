export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    const decoded = jwt.verify(token, SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    return NextResponse.json({ loggedIn: true, user });
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
