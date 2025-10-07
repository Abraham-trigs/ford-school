// /store/authStore.ts
import { create } from "zustand";
import { apiGet, apiPost } from "@/lib/apiWrapper";

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  hydrated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false, // Prevent initial flicker
  hydrated: false,

  setAccessToken: (token: string) => set({ accessToken: token }),

  refreshUser: async () => {
    set({ isLoading: true });
    try {
      const data = await apiGet<{ user: User }>("/auth/profile");
      set({ user: data?.user ?? null });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false, hydrated: true });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiPost("/auth/logout");
    } finally {
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await apiPost<{ user: User; accessToken: string }>("/auth/login", {
        email: email.trim(),
        password,
      });
      set({
        user: data.user,
        accessToken: data.accessToken,
        hydrated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ user: null, accessToken: null, hydrated: true, isLoading: false });
      throw err; // re-throw to let login page catch and display error
    }
  },
}));
