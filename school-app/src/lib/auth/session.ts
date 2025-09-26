// lib/auth/session.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { getUserInclude } from "@/lib/prisma/includes";

/**
 * verifySession
 * Verifies the JWT and checks the sessionKey in DB.
 * Returns { user, session } if valid, null otherwise.
 */
export const verifySession = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload?.userId || !payload?.sessionKey) return null;

    // Fetch session from DB including user relations
    const session = await prisma.sessionData.findUnique({
      where: { sessionKey: payload.sessionKey },
      include: {
        user: getUserInclude(undefined, true), // full user include for SessionStore
      },
    });

    if (!session) return null;

    return {
      user: session.user,
      session,
    };
  } catch (err) {
    console.error("Session verification failed:", err);
    return null;
  }
};
