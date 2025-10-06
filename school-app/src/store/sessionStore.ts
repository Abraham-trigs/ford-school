"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile, apiGetProfile } from "@/lib/api/profile";
import { apiRefreshToken } from "@/lib//auth";

interface SessionState {
  token: string | null;
  user: Profile | null;
  loading: boolean;
  error: string | null;

  setToken: (token: string | null) => void;
  clearSession: () => void;
  refreshProfile: (force?: boolean) => Promise<Profile | null>;
  refreshAccessToken: () => Promise<string | null>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      setToken: (token) => set({ token }),

      clearSession: () => {
        set({ token: null, user: null, error: null });
        localStorage.removeItem("session-store");
      },

      refreshProfile: async (force = false) => {
        const current = get().user;
        if (current && !force) return current;

        set({ loading: true, error: null });
        try {
          const profile = await apiGetProfile();

          // ✅ Only update state if different to prevent unnecessary renders
          if (JSON.stringify(current) !== JSON.stringify(profile)) {
            set({ user: profile, loading: false });
          } else {
            set({ loading: false });
          }

          return profile;
        } catch (err: any) {
          console.error("Profile refresh error:", err.message || err);
          set({ user: null, loading: false, error: err.message });
          return null;
        }
      },

      refreshAccessToken: async () => {
        try {
          const token = await apiRefreshToken();
          if (!token) throw new Error("No token returned");
          set({ token });
          return token;
        } catch (err: any) {
          console.error("refreshAccessToken failed:", err.message || err);
          get().clearSession();
          return null;
        }
      },
    }),
    {
      name: "session-store",
      version: 2,
      partialize: (state) => ({ user: state.user, token: state.token }),
      migrate: (persistedState, version) =>
        version < 2 ? { user: null, token: null } : persistedState,
    }
  )
);
