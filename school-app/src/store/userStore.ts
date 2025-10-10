import { create } from "zustand";
import { getUserFromCookie } from "@/lib/auth/cookies"; // your function

interface School {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  school?: School | null;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setUserFromCookie: (cookieUser: User) => void; // SSR setter
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setUserFromCookie: (user) => set({ user }),
}));
