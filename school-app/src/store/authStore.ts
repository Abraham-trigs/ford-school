"use client";

import { create } from "zustand";

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  /**
   * Sets the current authenticated user
   */
  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),

  /**
   * Logs out the user by calling the API and clearing the store
   */
  logout: async () => {
    try {
      // Call the logout endpoint; it should clear the HttpOnly cookie
      await fetch("/api/session/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    // Clear the store state
    set({ user: null, isAuthenticated: false });
  },
}));
