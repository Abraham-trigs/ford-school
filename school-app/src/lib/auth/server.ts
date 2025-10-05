import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // App Router cookie helper
import { prisma } from "@/lib/prisma/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  userId: number;
  role: string;
  schoolSessionId: number;
  iat?: number;
  exp?: number;
}

export async function getUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          where: { schoolSessionId: payload.schoolSessionId, active: true },
        },
      },
    });

    return user || null;
  } catch {
    return null;
  }
}
