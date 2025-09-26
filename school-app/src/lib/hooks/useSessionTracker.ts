// lib/hooks/useSessionTracker.ts
import { useEffect } from "react";
import { useSessionStore } from "@/lib/store/sessionStore";
import { getUserInclude } from "@/lib/prisma/includes";

type SessionActivityOptions = {
  trackClicks?: boolean;
  trackKeyboard?: boolean;
  trackBookmarks?: boolean;
  trackMouse?: boolean;
  trackScroll?: boolean;
  includeFields?: Partial<Record<keyof ReturnType<typeof getUserInclude>, boolean>>; // page-specific include
};

const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const useSessionTracker = (options: SessionActivityOptions = {}) => {
  const { sessionKey, userId, sessionActivity, updateSession, fullUserData } = useSessionStore.getState();

  useEffect(() => {
    if (!userId || !sessionKey) return;

    const page = window.location.pathname;

    // -------------------
    // Batched activity
    // -------------------
    const activityBatch: Record<string, any> = {};

    const flushBatch = () => {
      if (Object.keys(activityBatch).length === 0) return;

      const mergedActivity: Record<string, any> = { ...sessionActivity };

      for (const key in activityBatch) {
        if (Array.isArray(activityBatch[key])) {
          mergedActivity[key] = [...(mergedActivity[key] || []), ...activityBatch[key]];
        } else if (typeof activityBatch[key] === "object") {
          mergedActivity[key] = { ...(mergedActivity[key] || {}), ...activityBatch[key] };
        } else {
          mergedActivity[key] = activityBatch[key];
        }
      }

      updateSession(mergedActivity);
      for (const key in activityBatch) delete activityBatch[key];
    };

    const debouncedFlush = debounce(flushBatch, 2000);

    // -------------------
    // Track activity
    // -------------------
    activityBatch.pagesVisited = [
      ...(activityBatch.pagesVisited || []),
      { page, timestamp: new Date().toISOString() },
    ];

    if (options.includeFields && fullUserData) {
      const partialData: Record<string, any> = {};
      for (const key in options.includeFields) {
        if (options.includeFields[key]) partialData[key] = fullUserData[key];
      }
      activityBatch.userPartial = partialData; // merge partial page-specific user data
    }

    const handleClick = (e: MouseEvent) => {
      if (!options.trackClicks) return;
      const el = e.target as HTMLElement;
      activityBatch.clicks = [
        ...(activityBatch.clicks || []),
        { elementId: el?.id || undefined, page, timestamp: new Date().toISOString() },
      ];
      debouncedFlush();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (!options.trackKeyboard) return;
      const active = document.activeElement as HTMLInputElement | null;
      if (active && active.tagName === "INPUT") {
        activityBatch.keyboardInputs = [
          ...(activityBatch.keyboardInputs || []),
          { page, input: active.value, timestamp: new Date().toISOString() },
        ];
        debouncedFlush();
      }
    };

    const handleScroll = () => {
      if (!options.trackScroll) return;
      activityBatch.scrollPositions = [
        ...(activityBatch.scrollPositions || []),
        { page, position: window.scrollY, timestamp: new Date().toISOString() },
      ];
      debouncedFlush();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!options.trackMouse) return;
      activityBatch.mouseMovements = [
        ...(activityBatch.mouseMovements || []),
        { x: e.clientX, y: e.clientY, timestamp: new Date().toISOString() },
      ];
      debouncedFlush();
    };

    // -------------------
    // Snapshot storage/cookies once
    // -------------------
    activityBatch.localStorageData = { ...localStorage };
    activityBatch.sessionStorageData = { ...sessionStorage };
    activityBatch.cookiesData = Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")));

    debouncedFlush();

    // -------------------
    // Attach event listeners
    // -------------------
    window.addEventListener("click", handleClick);
    window.addEventListener("keyup", handleKey);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keyup", handleKey);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      flushBatch();
    };
  }, [sessionKey, userId, options, sessionActivity, updateSession, fullUserData]);
};
