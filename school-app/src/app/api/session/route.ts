// app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { verifyJWT } from "@/lib/auth/auth";
import { getSessionInclude, getUserInclude } from "@/lib/prisma/includes";

// ----------------------------
// GET /api/session -> fetch session + user
// ----------------------------
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "light"; // default to light

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload?.userId || !payload?.sessionKey)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await prisma.sessionData.findUnique({
      where: { sessionKey: payload.sessionKey },
      include: {
        ...getSessionInclude(undefined, type === "full"),
        user: getUserInclude(undefined, type === "full"),
      },
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ----------------------------
// POST /api/session -> create or refresh session
// ----------------------------
export async function POST(req: NextRequest) {
  try {
    const { userId, device, ip } = await req.json();
    if (!userId) return NextResponse.json({ error: "UserId is required" }, { status: 400 });

    const sessionKey = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const session = await prisma.sessionData.create({
      data: { userId, sessionKey, device, ip, createdAt: new Date(), expiresAt },
      include: {
        ...getSessionInclude(undefined, true), // full session include
        user: getUserInclude(undefined, true),  // full user include
      },
    });

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Session create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ----------------------------
// PATCH /api/session -> update session activity incrementally
// ----------------------------
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload?.userId || !payload?.sessionKey)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = await req.json();

    // Fetch existing session
    const existingSession = await prisma.sessionData.findUnique({
      where: { sessionKey: payload.sessionKey },
    });
    if (!existingSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Merge array fields incrementally
    const arrayFields = [
      "pagesVisited",
      "clicks",
      "keyboardInputs",
      "bookmarks",
      "externalPagesVisited",
      "mouseMovements",
      "scrollPositions",
    ];

    const mergedUpdates: Record<string, any> = { ...updates };
    for (const field of arrayFields) {
      if (updates[field]) {
        mergedUpdates[field] = [...(existingSession[field] || []), ...updates[field]];
      }
    }

    const updatedSession = await prisma.sessionData.update({
      where: { sessionKey: payload.sessionKey },
      data: {
        ...mergedUpdates,
        localStorageData: updates.localStorageData ?? existingSession.localStorageData,
        sessionStorageData: updates.sessionStorageData ?? existingSession.sessionStorageData,
        cookiesData: updates.cookiesData ?? existingSession.cookiesData,
        activeTime: updates.activeTime ?? existingSession.activeTime,
        userSessionUpdates: {
          create: { updatedAt: new Date(), updateReason: "session update" },
        },
      },
      include: {
        ...getSessionInclude(undefined, true), // full session include
        user: getUserInclude(undefined, true),  // full user include
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (err) {
    console.error("Session update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
