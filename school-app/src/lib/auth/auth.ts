// lib/auth/session.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { getUserInclude } from "@/lib/prisma/includes";

export const verifySession = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload = verifyJWT(token);
    if (!payload?.userId || !payload?.sessionKey) return null;

    const session = await prisma.sessionData.findUnique({
      where: { sessionKey: payload.sessionKey },
      include: { user: getUserInclude(undefined, true) },
    });

    if (!session) return null;

    return { user: session.user, session };
  } catch (err) {
    console.error("Session verification failed:", err);
    return null;
  }
};
