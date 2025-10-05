"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/sessions/profile");
      if (!res.ok) {
        set({ user: null, isAuthenticated: false });
        return;
      }
      const data = await res.json();
      set({ user: data.data, isAuthenticated: true });
    } catch (err) {
      console.error("Failed to hydrate auth:", err);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      set({ user: data.data.user, isAuthenticated: true });
      toast.success("Login successful!");
    } catch (err: any) {
      set({ user: null, isAuthenticated: false });
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await fetch("/api/sessions/logout", { method: "POST" });
      set({ user: null, isAuthenticated: false });
      toast.success("Logged out!");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
