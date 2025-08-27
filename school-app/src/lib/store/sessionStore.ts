import { create } from "zustand";

interface UserSession {
  id: string;
  email: string;
  role: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: UserSession | null;
}

interface SessionStore {
  user: UserSession | null;
  authenticated: boolean;
  loading: boolean;
  role: string | null;

  fetchSession: () => Promise<void>;
  login: (user: UserSession) => void;
  logout: () => void;

  // role helpers
  setRole: (role: string) => void;
  clearRole: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  authenticated: false,
  loading: false,
  role: null,

  fetchSession: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/session");
      const data: SessionResponse = await res.json();

      if (data.authenticated && data.user) {
        set({ user: data.user, authenticated: true, role: data.user.role });
      } else {
        set({ user: null, authenticated: false, role: null });
      }
    } catch (err) {
      console.error("fetchSession error:", err);
      set({ user: null, authenticated: false, role: null });
    } finally {
      set({ loading: false });
    }
  },

  login: (user: UserSession) => {
    set({ user, authenticated: true, role: user.role });
  },

  logout: () => {
    document.cookie = "session=; Max-Age=0; path=/; sameSite=lax; secure";
    set({ user: null, authenticated: false, loading: false, role: null });
  },

  setRole: (role: string) => {
    set({ role });
  },

  clearRole: () => {
    set({ role: null });
  },
}));
