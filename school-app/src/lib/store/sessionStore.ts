import { create } from "zustand";

interface UserSession {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface SessionResponse {
  loggedIn: boolean;
  user: UserSession | null;
}

interface SessionStore {
  user: UserSession | null;
  loggedIn: boolean;
  loading: boolean;
  role: string | null;

  fetchSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  setRole: (role: string) => void;
  clearRole: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  loggedIn: false,
  loading: false,
  role: null,

  // --- fetch session from backend cookie ---
  fetchSession: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/session");
      const data: SessionResponse = await res.json();

      if (data.loggedIn && data.user) {
        set({
          user: data.user,
          loggedIn: true,
          role: data.user.role,
        });
      } else {
        set({
          user: null,
          loggedIn: false,
          role: null,
        });
      }
    } catch (err) {
      console.error("fetchSession error:", err);
      set({ user: null, loggedIn: false, role: null });
    } finally {
      set({ loading: false });
    }
  },

  // --- login with email/password ---
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // fetch session again so state matches cookie
        await useSessionStore.getState().fetchSession();
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      console.error("login error:", err);
      set({ user: null, loggedIn: false, role: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // --- logout (clear cookie + state) ---
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("logout error:", err);
    }
    set({ user: null, loggedIn: false, loading: false, role: null });
  },

  setRole: (role: string) => set({ role }),
  clearRole: () => set({ role: null }),
}));
