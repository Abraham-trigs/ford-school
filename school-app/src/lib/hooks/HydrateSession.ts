"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/sessionStore";

/**
 * Hydrates session from cache, revalidates profile,
 * and refreshes accessToken in the background.
 */
export function useHydrateSession() {
  const router = useRouter();
  const initCalled = useRef(false);

  const { refreshProfile, refreshAccessToken, clearSession } = useSessionStore();

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const init = async () => {
      // 1️⃣ Load cached user immediately
      const cachedUser = useSessionStore.getState().user;

      // 2️⃣ Attempt to refresh access token
      const token = await refreshAccessToken();
      if (!token) {
        clearSession();
        return router.replace("/login");
      }

      // 3️⃣ Revalidate profile in background
      const profile = await refreshProfile(true);
      if (!profile) {
        clearSession();
        return router.replace("/login");
      }
    };

    init();

    // 4️⃣ Schedule periodic token refresh (every 10 minutes)
    const interval = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        clearSession();
        router.replace("/login");
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refreshProfile, refreshAccessToken, clearSession, router]);
}
