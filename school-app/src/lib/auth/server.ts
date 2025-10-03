import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // App Router cookie helper
import { prisma } from "@/lib/prisma/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { memberships: true },
    });

    return user || null;
  } catch {
    return null;
  }
}
