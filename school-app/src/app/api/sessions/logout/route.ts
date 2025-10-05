import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const session = await prisma.userSession.findFirst({
      where: { token, revoked: false },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or already revoked" }, { status: 404 });
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: { revoked: true },
    });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
