// lib/api/sessionApi.ts
import { fetch } from "next/dist/compiled/@edge-runtime/primitives/fetch";
import { Prisma } from "@prisma/client";
import {  userFullBase,  } from "@/lib/prisma/includes";

// Type-safe session updates
export type SessionUpdates<T extends Prisma.UserInclude = typeof userFullBase> = Partial<{
  pagesVisited: string[];
  clicks: string[];
  keyboardInputs: string[];
  bookmarks: string[];
  externalPagesVisited: string[];
  mouseMovements: string[];
  scrollPositions: string[];
  localStorageData: Record<string, string>;
  sessionStorageData: Record<string, string>;
  cookiesData: Record<string, string>;
  activeTime: number;

  // Optional Prisma-style includes for selective user data
  includes: Partial<T>;
}>;

/**
 * fetchUserData
 * Fetches session + user from backend with optional type-safe includes
 */
export const fetchUserData = async <T extends Prisma.UserInclude = typeof userFullBase>(
  userId: string,
  type: "full" | "light" = "light",
  include?: Partial<T>
): Promise<T extends typeof userFullBase ? Prisma.UserGetPayload<{ include: T }> : any> => {
  try {
    const res = await fetch(`/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, include }),
    });

    if (!res.ok) throw new Error("Failed to fetch session data");

    const data = await res.json();

    if (type === "light" && !include) {
      return {
        user: data.session.user,
        sessionKey: data.session.sessionKey,
      } as any;
    }

    return data.session;
  } catch (err) {
    console.error("fetchUserData error:", err);
    throw err;
  }
};

/**
 * createSession
 */
export const createSession = async (userId: string, device?: string, ip?: string) => {
  try {
    const res = await fetch(`/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, device, ip }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    return await res.json();
  } catch (err) {
    console.error("createSession error:", err);
    throw err;
  }
};

/**
 * patchSessionData
 * Incrementally updates session activity
 */
export const patchSessionData = async <T extends Prisma.UserInclude = typeof userFullBase>(
  updates: SessionUpdates<T>
) => {
  try {
    const res = await fetch(`/api/session`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to patch session data");

    const data = await res.json();
    return data.session ?? data;
  } catch (err) {
    console.error("patchSessionData error:", err);
    throw err;
  }
};
