import { create } from "zustand";
import { apiGetUsers, apiGetUserById } from "@/lib/api/users";
import { useUserFilters } from "@/store/userFilters";

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface UserState {
  userList: User[];
  userMap: Record<number, User>;
  loading: boolean;
  total: number;

  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
}

export const useUserStore = create<UserState>((set, get) => ({
  userList: [],
  userMap: {},
  loading: false,
  total: 0,

  /* ------------------- Fetch all users ------------------- */
  fetchUsers: async () => {
    const filters = useUserFilters.getState();
    const { page, pageSize, role, active, sort, search } = filters;

    set({ loading: true });

    try {
      const res = await apiGetUsers({
        page,
        pageSize,
        role,
        search,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const data = res.data || [];
      const userMap: Record<number, User> = {};
      data.forEach((u) => (userMap[u.id] = u));

      set({
        userList: data,
        userMap,
        total: res.meta?.total ?? 0,
        loading: false,
      });
    } catch (error: any) {
      console.error("Failed to fetch users:", error.message || error);
      set({ loading: false });
    }
  },

  /* ------------------- Fetch single user by ID ------------------- */
  fetchUserById: async (id: number) => {
    const cached = get().userMap[id];
    if (cached) return cached;

    set({ loading: true });

    try {
      const res = await apiGetUserById(id);
      const user = res.data;

      set((state) => ({
        userMap: { ...state.userMap, [id]: user },
        loading: false,
      }));

      return user;
    } catch (error: any) {
      console.error("Failed to fetch user by ID:", error.message || error);
      set({ loading: false });
      return null;
    }
  },
}));

/* ------------------- Auto-fetch on app hydration ------------------- */
if (typeof window !== "undefined") {
  const { fetchUsers } = useUserStore.getState();
  fetchUsers().catch((err) => console.error("Auto-fetch failed:", err));
}
