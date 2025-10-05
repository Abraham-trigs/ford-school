import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      // No token: user is not logged in
      return NextResponse.json({ data: null });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      // Invalid/expired token
      return NextResponse.json({ data: null });
    }

    const session = await prisma.userSession.findFirst({
      where: { token, revoked: false, expiresAt: { gt: new Date() } },
      include: {
        user: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ data: null });
    }

    const membership = session.user.memberships.find(
      (m) => m.id === payload.membershipId
    );

    return NextResponse.json({
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.fullName,
          profilePicture: session.user.profilePicture,
          role: membership?.role,
          schoolSessionId: membership?.schoolSessionId,
        },
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ data: null });
  }
}
