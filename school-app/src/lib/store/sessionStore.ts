// lib/store/sessionStore.ts
import { create } from "zustand";
import { fetchUserData, patchSessionData, SessionUpdates } from "@/lib/api/sessionApi";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";
import {
  userLightBase,
  userFullBase,
  getUserInclude,
} from "@/lib/prisma/includes";

// Type-safe User payloads
type UserLight = Prisma.UserGetPayload<{ include: typeof userLightBase }>;
type UserFull = Prisma.UserGetPayload<{ include: typeof userFullBase }>;

interface SessionStoreState {
  sessionKey: string | null;
  fullUserData: UserFull | null;
  pageData: Record<string, UserLight | UserFull>;
  pageSessionKeys: Record<string, string>;
  sessionValid: (page: string) => boolean;

  sessionActivity: Partial<SessionUpdates>;

  refreshSessionKey: () => void;
  fetchPageData: (page: string, useFull?: boolean, pageIncludes?: any) => Promise<UserLight | UserFull>;
  updateSession: (activity: Partial<SessionUpdates>, reason?: string) => void;
  clearSession: () => void;
}

const DEBOUNCE_MS = 2000;

export const useSessionStore = create<SessionStoreState>((set, get) => {
  let debounceTimer: NodeJS.Timeout | null = null;

  return {
    sessionKey: null,
    fullUserData: null,
    pageData: {},
    pageSessionKeys: {},
    sessionActivity: {},

    sessionValid: (page) => {
      const currentKey = get().sessionKey;
      const pageKey = get().pageSessionKeys[page];
      return currentKey && pageKey === currentKey;
    },

    refreshSessionKey: () => {
      const newKey = uuidv4();
      set({
        sessionKey: newKey,
        pageSessionKeys: {},
        sessionActivity: {},
      });
    },

fetchPageData: async (page, useFull = false, pageInclude?: Record<string, boolean>) => {
  const { sessionKey, pageSessionKeys, fullUserData, pageData } = get();
  if (!sessionKey) throw new Error("No session key found");

  if (get().sessionValid(page)) return pageData[page];

  let data;
  if (useFull && !fullUserData) {
    // First mount: fetch full user
    data = await fetchUserData("", "full"); 
    set({ fullUserData: data as UserFull });
  } else {
    // Only fetch includes needed for this page
    data = await fetchUserData("", "light", pageInclude ?? userLightBase);
  }

  // Update current page cache
  set((state) => ({
    pageData: { ...state.pageData, [page]: data },
    pageSessionKeys: { ...state.pageSessionKeys, [page]: state.sessionKey! },
  }));

  // Silent merge other pages
  if (fullUserData && page !== "fullUser") {
    const updatedPages: Record<string, UserLight | UserFull> = {};
    Object.keys(pageData).forEach((p) => {
      if (p !== page && pageSessionKeys[p] !== sessionKey) {
        updatedPages[p] = { ...pageData[p], ...fullUserData };
      }
    });
    if (Object.keys(updatedPages).length > 0) {
      set((state) => ({ pageData: { ...state.pageData, ...updatedPages } }));
    }
  }

  return data;
}

    updateSession: (activity, reason = "activity update") => {
      set((state) => ({
        sessionActivity: { ...state.sessionActivity, ...activity },
      }));

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const { sessionActivity, sessionKey } = get();
        if (!sessionKey || Object.keys(sessionActivity).length === 0) return;

        try {
          await patchSessionData({ ...sessionActivity, updateReason: reason });
          set({ sessionActivity: {} });
        } catch (err) {
          console.error("Failed to sync session activity:", err);
        }
      }, DEBOUNCE_MS);
    },

    clearSession: () =>
      set({
        sessionKey: null,
        fullUserData: null,
        pageData: {},
        pageSessionKeys: {},
        sessionActivity: {},
      }),
  };
});
