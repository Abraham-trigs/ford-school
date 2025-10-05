// store/sessionStore.ts
import { create } from "zustand";
import { Profile, apiGetProfile } from "@/lib/api/profile";

interface SessionState {
  user: Profile | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  setUser: (user: Profile) => void;
  setToken: (token: string) => void;
  clearSession: () => void;
  refreshProfile: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),
  setToken: (token) => set({ token }),
  clearSession: () => set({ user: null, token: null, error: null }),

  refreshProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await apiGetProfile();
      set({ user: profile });
    } catch (err: any) {
      set({ user: null, error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
