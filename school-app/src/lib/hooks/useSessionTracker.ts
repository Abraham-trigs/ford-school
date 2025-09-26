// lib/hooks/useSessionTracker.ts
import { useEffect } from "react";
import { useSessionStore } from "@/lib/store/sessionStore";

type SessionActivityOptions = {
  trackClicks?: boolean;
  trackKeyboard?: boolean;
  trackBookmarks?: boolean;
  trackMouse?: boolean;
  trackScroll?: boolean;
};

// Debounce utility
const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Hook: useSessionTracker
 * Tracks selective browser/app activity and updates session store
 */
export const useSessionTracker = (options: SessionActivityOptions = {}) => {
  const { sessionKey, userId, updateSession } = useSessionStore.getState();

  useEffect(() => {
    if (!userId || !sessionKey) return;

    const page = window.location.pathname;

    // Track page visit
    updateSession({
      pagesVisited: [{ page, timestamp: new Date().toISOString() }],
    });

    // -------------------
    // Event handlers
    // -------------------
    const handleClick = (e: MouseEvent) => {
      if (!options.trackClicks) return;

      const el = e.target as HTMLElement;
      updateSession({
        clicks: [
          {
            elementId: el?.id || undefined,
            page,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    };

    const handleKey = (e: KeyboardEvent) => {
      if (!options.trackKeyboard) return;

      const active = document.activeElement as HTMLInputElement | null;
      if (active && active.tagName === "INPUT") {
        updateSession({
          keyboardInputs: [
            {
              page,
              input: active.value,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }
    };

    const handleScroll = () => {
      if (!options.trackScroll) return;
      updateSession({
        scrollPositions: [
          {
            page,
            position: window.scrollY,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!options.trackMouse) return;
      updateSession({
        mouseMovements: [
          { x: e.clientX, y: e.clientY, timestamp: new Date().toISOString() },
        ],
      });
    };

    // -------------------
    // Debounced listeners
    // -------------------
    const debouncedClick = debounce(handleClick, 500);
    const debouncedKey = debounce(handleKey, 500);
    const debouncedScroll = debounce(handleScroll, 500);
    const debouncedMouse = debounce(handleMouseMove, 500);

    window.addEventListener("click", debouncedClick);
    window.addEventListener("keyup", debouncedKey);
    window.addEventListener("scroll", debouncedScroll);
    window.addEventListener("mousemove", debouncedMouse);

    // Optional: snapshot localStorage/sessionStorage/cookies
    updateSession({
      localStorageData: { ...localStorage },
      sessionStorageData: { ...sessionStorage },
      cookiesData: Object.fromEntries(
        document.cookie.split("; ").map((c) => c.split("="))
      ),
    });

    // Cleanup on unmount
    return () => {
      window.removeEventListener("click", debouncedClick);
      window.removeEventListener("keyup", debouncedKey);
      window.removeEventListener("scroll", debouncedScroll);
      window.removeEventListener("mousemove", debouncedMouse);
    };
  }, [sessionKey, userId, options]);
};
