import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const ACCESS_TOKEN_SECR = process.env.ACCESS_TOKEN_SECR!;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(null, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECR) as {
      id: string;
      role: string;
      schoolId?: string | null;
    };

    // Fetch user from UserAccount
    const user = await prisma.userAccount.findUnique({
      where: { id: decoded.id },
      include: { 
        schoolAccount: true, // include school relation if exists
      },
    });

    if (!user) return NextResponse.json(null, { status: 401 });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json(null, { status: 401 });
  }
}
