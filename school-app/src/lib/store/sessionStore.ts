"use client";

import { create } from "zustand";
import type { Role } from "@/types/school";
import { useUsersStore } from "@/lib/store/UserStore";

export interface UserSession {
  id: string;
  email: string;
  role: Role;
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
  role: Role | null;

  fetchSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  setUser: (user: UserSession | null) => void; // ✅ new
  setRole: (role: Role) => void;
  clearRole: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  user: null,
  loggedIn: false,
  loading: false,
  role: null,

  // --- Fetch session from API ---
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

        // --- Fetch users if allowed ---
        const usersStore = useUsersStore.getState();
        if (!usersStore.hasFetchedUsers) {
          await usersStore.fetchUsersIfAllowed();
          usersStore.setHasFetchedUsers(true);
        }
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

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        await get().fetchSession();
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

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      set({ user: null, loggedIn: false, loading: false, role: null });
    }
  },

  setUser: (user) => set({ user, loggedIn: !!user, role: user?.role ?? null }), // ✅ safe update
  setRole: (role) => set({ role }),
  clearRole: () => set({ role: null }),
}));
