export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // get token from cookies
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    // verify JWT
    const decoded = jwt.verify(token, SECRET) as { id: string; email: string; role: string };

    // fetch user from DB (optional, ensures user still exists)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json({ loggedIn: false });
  }
}
