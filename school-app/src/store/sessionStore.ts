// store/sessionStore.ts
import { create } from "zustand";
import { Profile, apiGetProfile } from "@/lib/api/profile";

interface SessionState {
  token: string | null;
  user: Profile | null;
  loading: boolean;
  error: string | null;

  // Actions
  setToken: (token: string) => void;
  clearSession: () => void;
  refreshProfile: () => Promise<void>;
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
      set({ user: profile, loading: false });
    } catch (err: any) {
      console.error("Profile refresh error:", err.message || err);
      set({ user: null, loading: false, error: err.message });
    }
  },
}));
