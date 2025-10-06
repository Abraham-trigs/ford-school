import { create } from "zustand";
import { Profile, apiGetProfile } from "@/lib/api/profile";

interface SessionState {
  token: string | null;
  user: Profile | null;
  loading: boolean;
  error: string | null;

  setToken: (token: string) => void;
  clearSession: () => void;
  refreshProfile: () => Promise<Profile | null>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  setToken: (token) => set({ token }),

  clearSession: () => set({ token: null, user: null, error: null }),

  refreshProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await apiGetProfile();
      const current = get().user;

      // 🧠 Avoid redundant state updates → prevents render/fetch loops
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
}));
