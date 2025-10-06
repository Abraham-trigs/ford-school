"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

interface DecodedToken {
  exp: number;
}

const RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

export function useAutoRefresh() {
  const refreshAccessToken = useSessionStore((s) => s.refreshAccessToken);
  const token = useSessionStore((s) => s.token);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!token) return;

    // Clear previous timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let decoded: DecodedToken;
    try {
      decoded = jwtDecode<DecodedToken>(token);
    } catch {
      console.warn("Failed to decode token");
      return;
    }

    const expiresAt = decoded.exp * 1000;
    const now = Date.now();
    const refreshTime = Math.max(expiresAt - now - 60 * 1000, 0); // 1 min before expiry

    const handleRefresh = async () => {
      try {
        await refreshAccessToken();
        retryCountRef.current = 0; // reset on success
      } catch (err: any) {
        console.error("Auto-refresh failed:", err.message || err);
        retryCountRef.current += 1;

        if (retryCountRef.current <= MAX_RETRIES) {
          console.log(`Retrying refresh in ${RETRY_DELAY / 1000}s (attempt ${retryCountRef.current})`);
          timeoutRef.current = setTimeout(handleRefresh, RETRY_DELAY);
        } else {
          toast.error("Session refresh failed. Please log in again.");
        }
      }
    };

    // Only refresh if tab is visible
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        handleRefresh();
      } else {
        // Wait until tab becomes visible
        const onVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            handleRefresh();
            document.removeEventListener("visibilitychange", onVisibilityChange);
          }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
      }
    };

    timeoutRef.current = setTimeout(refreshIfVisible, refreshTime);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, refreshAccessToken]);
}
