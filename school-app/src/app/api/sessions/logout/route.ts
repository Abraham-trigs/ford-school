// /api/sessions/logout.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (token) {
      await prisma.userSession.updateMany({
        where: { token },
        data: { revoked: true },
      });
    }

    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set({
      name: "token",
      value: "",
      path: "/",
      httpOnly: true,
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
