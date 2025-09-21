// File: /app/api/auth/session/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    let decoded: { id: string; email: string; role: string; name?: string };

    try {
      decoded = jwt.verify(token, SECRET) as {
        id: string;
        email: string;
        role: string;
        name?: string;
      };
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ loggedIn: false, user: null });
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || "",
      },
    });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json({ loggedIn: false, user: null }, { status: 500 });
  }
}
