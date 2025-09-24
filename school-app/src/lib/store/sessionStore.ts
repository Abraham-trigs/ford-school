"use client";

import { create } from "zustand";
import type { Role, User } from "@/types/school";
import { useUsersStore } from "@/lib/store/UserStore";

export interface UserSession extends User {
  role: Role;
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
  firstName: string;
  isSuperAdmin: boolean;
  sessionFetched: boolean; // NEW FLAG

  fetchSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  setUser: (user: UserSession | null) => void;
  setRole: (role: Role) => void;
  clearRole: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  user: null,
  loggedIn: false,
  loading: false,
  role: null,
  firstName: "User",
  isSuperAdmin: false,
  sessionFetched: false, // NEW

  fetchSession: async () => {
    const state = get();
    if (state.sessionFetched) return; // skip if already fetched

    set({ loading: true });
    try {
      const res = await fetch("/api/auth/session");
      const data: SessionResponse = await res.json();

      if (data.loggedIn && data.user) {
        const usersStore = useUsersStore.getState();

        // Ensure UsersStore is populated
        if (!usersStore.hasFetchedUsers) {
          await usersStore.fetchUsersIfAllowed();
          usersStore.setHasFetchedUsers(true);
        }

        const fullUser = usersStore.userMap[data.user.id] ?? data.user;
        const firstName = fullUser.name?.split(" ")[0]?.trim() ?? "User";

        set({
          user: fullUser,
          loggedIn: true,
          role: fullUser.role,
          firstName,
          isSuperAdmin: fullUser.role === "SUPERADMIN",
          sessionFetched: true, // mark as fetched
        });
      } else {
        set({
          user: null,
          loggedIn: false,
          role: null,
          firstName: "User",
          isSuperAdmin: false,
          sessionFetched: true,
        });
      }
    } catch (err) {
      console.error("fetchSession error:", err);
      set({
        user: null,
        loggedIn: false,
        role: null,
        firstName: "User",
        isSuperAdmin: false,
        sessionFetched: true,
      });
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
      set({
        user: null,
        loggedIn: false,
        role: null,
        firstName: "User",
        isSuperAdmin: false,
      });
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
      set({
        user: null,
        loggedIn: false,
        loading: false,
        role: null,
        firstName: "User",
        isSuperAdmin: false,
        sessionFetched: false, // reset flag
      });
    }
  },

  setUser: (user) =>
    set({
      user,
      loggedIn: !!user,
      role: user?.role ?? null,
      firstName: user?.name?.split(" ")[0]?.trim() ?? "User",
      isSuperAdmin: user?.role === "SUPERADMIN",
    }),

  setRole: (role) =>
    set({
      role,
      isSuperAdmin: role === "SUPERADMIN",
    }),

  clearRole: () =>
    set({
      role: null,
      isSuperAdmin: false,
    }),
}));
