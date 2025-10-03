import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Check token from Authorization header or cookie
    const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify token and extract payload
    const payload: any = authenticate({ headers: { get: () => `Bearer ${token}` } } as NextRequest);

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { memberships: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: payload.roles,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
