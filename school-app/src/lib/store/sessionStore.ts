// lib/store/sessionStore.ts
import { create } from "zustand";
import { fetchUserData, patchSessionData } from "@/lib/api/sessionApi";
import { v4 as uuidv4 } from "uuid";

interface SessionStoreState {
  userId: string | null;
  sessionKey: string | null;
  pageData: Record<string, any>;
  pageSessionKeys: Record<string, string>;
  sessionValid: (page: string) => boolean;

  // activity tracking
  sessionActivity: Record<string, any>;

  // setters
  setUserId: (id: string) => void;
  refreshSessionKey: () => void;
  fetchPageData: (page: string, useFull?: boolean) => Promise<any>;
  updateSession: (activity: Partial<Record<string, any>>, reason?: string) => void;
  clearSession: () => void;
}

const DEBOUNCE_MS = 2000;

export const useSessionStore = create<SessionStoreState>((set, get) => {
  let debounceTimer: NodeJS.Timeout | null = null;

  return {
    userId: null,
    sessionKey: null,
    pageData: {},
    pageSessionKeys: {},
    sessionActivity: {},

    sessionValid: (page) => {
      const currentKey = get().sessionKey;
      const pageKey = get().pageSessionKeys[page];
      return currentKey && pageKey === currentKey;
    },

    setUserId: (id) => {
      const newKey = uuidv4();
      set({
        userId: id,
        sessionKey: newKey,
        pageData: {},
        pageSessionKeys: {},
        sessionActivity: {},
      });
    },

    refreshSessionKey: () => {
      const newKey = uuidv4();
      set((state) => ({
        sessionKey: newKey,
        pageSessionKeys: {},
        sessionActivity: {},
      }));
    },

    fetchPageData: async (page, useFull = false) => {
      const { userId, sessionKey, pageSessionKeys, pageData } = get();
      if (!userId) throw new Error("No userId found in session");

      if (get().sessionValid(page)) return pageData[page];

      const data = await fetchUserData(userId, useFull ? "full" : "light");

      set((state) => ({
        pageData: { ...state.pageData, [page]: data },
        pageSessionKeys: { ...state.pageSessionKeys, [page]: sessionKey },
      }));

      return data;
    },

    /**
     * updateSession
     * Merge front-end activity with existing state and sync with backend.
     * @param activity Partial session activity to merge
     * @param reason Optional reason for the update (e.g., 'manual refresh', 'form entry')
     */
    updateSession: (activity, reason = "activity update") => {
      // Merge new activity into existing sessionActivity
      set((state) => ({
        sessionActivity: {
          ...state.sessionActivity,
          ...Object.keys(activity).reduce((acc, key) => {
            // For arrays, append instead of replacing
            if (Array.isArray(activity[key])) {
              acc[key] = [...(state.sessionActivity[key] || []), ...activity[key]];
            } else {
              acc[key] = activity[key];
            }
            return acc;
          }, {} as Record<string, any>),
        },
      }));

      // Debounced backend sync
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const { sessionActivity, sessionKey } = get();
        if (!sessionKey || Object.keys(sessionActivity).length === 0) return;

        try {
          await patchSessionData({ ...sessionActivity, updateReason: reason }); // call PATCH API
          // Clear local sessionActivity after successful sync
          set({ sessionActivity: {} });
        } catch (err) {
          console.error("Failed to sync session activity:", err);
        }
      }, DEBOUNCE_MS);
    },

    clearSession: () =>
      set({
        userId: null,
        sessionKey: null,
        pageData: {},
        pageSessionKeys: {},
        sessionActivity: {},
      }),
  };
});
