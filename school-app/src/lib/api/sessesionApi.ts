// lib/api/sessionApi.ts
import { fetch } from "next/dist/compiled/@edge-runtime/primitives/fetch";
import { userLightBase, userFullBase } from "@/lib/prisma/includes";
import { Prisma } from "@prisma/client";

// Type-safe session update based on Prisma includes
export type SessionUpdates = Partial<{
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

  // Optional per-page includes
  includes: Partial<Record<keyof typeof userFullBase, boolean>>;
}>;

/**
 * fetchUserData
 * Fetches session + user from backend.
 * @param userId - currently unused, kept for interface compatibility
 * @param type - "light" returns minimal user/session, "full" returns everything
 * @param include - optional Prisma-style include object for selective page-level data
 */
export const fetchUserData = async (
  userId: string,
  type: "full" | "light" = "light",
  include?: Partial<Record<keyof typeof userFullBase, boolean>>
) => {
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
      };
    }

    return data.session;
  } catch (err) {
    console.error("fetchUserData error:", err);
    throw err;
  }
};

/**
 * createSession
 * Creates a new session in backend.
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
 * Incrementally updates session activity in backend.
 * Safely merges array fields and other session properties.
 */
export const patchSessionData = async (updates: SessionUpdates) => {
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
