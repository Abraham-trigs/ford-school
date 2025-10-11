import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth/cookies";
import { prisma } from "@/lib/prisma";

// Handles GET /api/me – returns current authenticated user
export async function GET() {
  const payload = await getUserFromCookie();

  if (!payload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.userAccount.findUnique({
    where: { id: payload.userId },
    include: { schoolAccount: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    school: user.schoolAccount
      ? { id: user.schoolAccount.id, name: user.schoolAccount.name }
      : null,
  });
}
