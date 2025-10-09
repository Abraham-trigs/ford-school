import { create } from "zustand";

interface School {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  school: School;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
