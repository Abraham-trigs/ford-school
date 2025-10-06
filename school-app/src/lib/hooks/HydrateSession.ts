"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/sessionStore";

/**
 * Hydrates session from cache, revalidates profile,
 * refreshes accessToken in the background, and checks user status in DB.
 */
export function useHydrateSession() {
  const router = useRouter();
  const initCalled = useRef(false);

  const { refreshProfile, refreshAccessToken, clearSession } = useSessionStore();

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const init = async () => {
      // 1️⃣ Instant render from cached user
      const cachedUser = useSessionStore.getState().user;

      // 2️⃣ Background validation: refresh access token + check DB
      const token = await refreshAccessToken(); // hits /api/auth/refresh
      if (!token) {
        clearSession();
        return router.replace("/login");
      }

      // 3️⃣ Revalidate profile to sync backend changes (roles, avatar, etc.)
      const profile = await refreshProfile(true);
      if (!profile) {
        clearSession();
        return router.replace("/login");
      }
    };

    init();

    // 4️⃣ Periodic background token refresh (every 10 minutes)
    const interval = setInterval(async () => {
      const token = await refreshAccessToken();
      if (!token) {
        clearSession();
        router.replace("/login");
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refreshProfile, refreshAccessToken, clearSession, router]);
}
