// store/authStore.ts
import { create } from "zustand";
import { apiGetProfile, Profile } from "@/lib/api/profile";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;

  // Actions
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  getMembershipRoles: () => string[];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isLoggedIn: false,

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await apiGetProfile();
      set({
        user: profile,
        isLoggedIn: !!profile,
        loading: false,
      });
    } catch (err: any) {
      set({ user: null, isLoggedIn: false, loading: false, error: err.message });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }

      // After login, fetch profile
      await get().fetchUser();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, isLoggedIn: false });
    fetch("/api/sessions/logout", { method: "POST", credentials: "include" });
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.memberships?.some((m) => m.role === role) ?? false;
  },

  getMembershipRoles: () => {
    const { user } = get();
    if (!user) return [];
    return user.memberships?.map((m) => m.role) ?? [];
  },
}));
