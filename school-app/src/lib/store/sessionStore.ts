// lib/store/sessionStore.ts
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { fetchUserData, patchSessionData, SessionUpdates } from "@/lib/api/sessesionApi";
import { Prisma } from "@prisma/client";
import { userLightBase, userFullBase } from "@/lib/prisma/includes";

type UserLight = Prisma.UserGetPayload<{ include: typeof userLightBase }>;
type UserFull = Prisma.UserGetPayload<{ include: typeof userFullBase }>;

interface SessionStoreState {
  sessionKey: string | null;
  fullUserData: UserFull | null;
  pageData: Record<string, UserLight | UserFull>;
  pageSessionKeys: Record<string, string>;
  sessionActivity: Partial<SessionUpdates>;
  sessionValid: (page: string) => boolean;

  refreshSessionKey: () => void;
  fetchPageData: (
    page: string,
    useFull?: boolean,
    pageInclude?: Record<string, boolean>
  ) => Promise<UserLight | UserFull>;
  updateSession: (activity: Partial<SessionUpdates>, reason?: string) => void;
  clearSession: () => void;
}

const DEBOUNCE_MS = 2000;

export const useSessionStore = create<SessionStoreState>((set, get) => {
  let debounceTimer: NodeJS.Timeout | null = null;

  const mergeActivity = (existing: Partial<SessionUpdates>, incoming: Partial<SessionUpdates>) => {
    const arrayFields: (keyof SessionUpdates)[] = [
      "pagesVisited",
      "clicks",
      "keyboardInputs",
      "bookmarks",
      "externalPagesVisited",
      "mouseMovements",
      "scrollPositions",
    ];

    const merged: Partial<SessionUpdates> = { ...existing };

    for (const key in incoming) {
      const field = key as keyof SessionUpdates;
      if (arrayFields.includes(field)) {
        merged[field] = [...(existing[field] || []), ...(incoming[field] || [])];
      } else if (typeof incoming[field] === "object" && incoming[field] !== null) {
        merged[field] = { ...(existing[field] || {}), ...(incoming[field] as object) };
      } else {
        merged[field] = incoming[field];
      }
    }
    return merged;
  };

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
      set((state) => ({
        sessionKey: newKey,
        pageSessionKeys: Object.keys(state.pageSessionKeys).reduce((acc, page) => {
          acc[page] = newKey;
          return acc;
        }, {} as Record<string, string>),
        sessionActivity: {},
      }));
    },

    fetchPageData: async (page, useFull = false, pageInclude?: Record<string, boolean>) => {
      const { sessionKey, pageSessionKeys, fullUserData, pageData } = get();
      if (!sessionKey) throw new Error("No session key found");

      if (get().sessionValid(page)) return pageData[page];

      let data;
      if (useFull && !fullUserData) {
        data = await fetchUserData("", "full");
        set({ fullUserData: data as UserFull });
      } else {
        data = await fetchUserData("", "light", pageInclude ?? userLightBase);
      }

      set((state) => ({
        pageData: { ...state.pageData, [page]: data },
        pageSessionKeys: { ...state.pageSessionKeys, [page]: state.sessionKey! },
      }));

      // Silent merge other pages if full data exists
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
    },

    updateSession: (activity, reason = "activity update") => {
      set((state) => ({
        sessionActivity: mergeActivity(state.sessionActivity, activity),
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

    clearSession: () => {
      set({
        sessionKey: null,
        fullUserData: null,
        pageData: {},
        pageSessionKeys: {},
        sessionActivity: {},
      });
    },
  };
});
