import { create } from "zustand";

interface UserSession {
  id: string;
  email: string;
  role: string;
  name?: string; // optional since your API returns it
}

interface SessionResponse {
  loggedIn: boolean;
  user?: UserSession | null;
}

interface SessionStore {
  user: UserSession | null;
  loggedIn: boolean;
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
  loggedIn: false,
  loading: false,
  role: null,

  fetchSession: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/session");
      const data: SessionResponse = await res.json();

      if (data.loggedIn && data.user) {
        set({ user: data.user, loggedIn: true, role: data.user.role });
      } else {
        set({ user: null, loggedIn: false, role: null });
      }
    } catch (err) {
      console.error("fetchSession error:", err);
      set({ user: null, loggedIn: false, role: null });
    } finally {
      set({ loading: false });
    }
  },

  login: (user: UserSession) => {
    set({ user, loggedIn: true, role: user.role });
  },

  logout: () => {
    document.cookie = "session=; Max-Age=0; path=/; sameSite=lax; secure";
    set({ user: null, loggedIn: false, loading: false, role: null });
  },

  setRole: (role: string) => {
    set({ role });
  },

  clearRole: () => {
    set({ role: null });
  },
}));
