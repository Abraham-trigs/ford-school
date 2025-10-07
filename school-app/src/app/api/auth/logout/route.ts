// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("refreshToken")?.value;
    if (!token) return NextResponse.json({ message: "Logged out" }, { status: 200 });

    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (storedToken?.familyId) {
      await prisma.refreshToken.updateMany({ where: { familyId: storedToken.familyId }, data: { revoked: true } });
    } else if (storedToken) {
      await prisma.refreshToken.update({ where: { token }, data: { revoked: true } });
    }

    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set({ name: "refreshToken", value: "", path: "/", httpOnly: true, maxAge: 0 });
    return res;
  } catch (err) {
    console.error("[LogoutRoute] Error:", err);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
