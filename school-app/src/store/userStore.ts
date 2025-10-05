import { create } from "zustand";
import { apiGetUsers, apiGetUserById } from "@/lib/api/users";
import { useUserFilters } from "@/store/userFilters";

/* ------------------------- Shared User Type ------------------------- */
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

/* ------------------------- Store Definition ------------------------- */
interface UserState {
  userList: User[];
  userMap: Record<number, User>;
  loading: boolean;
  total: number;

  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
}

/* ------------------------- Zustand Store ------------------------- */
export const useUserStore = create<UserState>((set, get) => ({
  userList: [],
  userMap: {},
  loading: false,
  total: 0,

  fetchUsers: async () => {
    const filters = useUserFilters.getState();
    const { page, pageSize, role, active, sort, search } = filters;

    set({ loading: true });

    try {
      const { data, meta } = await apiGetUsers({
        page,
        pageSize,
        role,
        active,
        search,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const userMap: Record<number, User> = {};
      data.forEach((u: User) => (userMap[u.id] = u));

      set({
        userList: data,
        userMap,
        total: meta?.total ?? 0,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ loading: false });
    }
  },

  fetchUserById: async (id: number) => {
    const cached = get().userMap[id];
    if (cached) return cached;

    set({ loading: true });

    try {
      const user = await apiGetUserById(id);

      set((state) => ({
        userMap: { ...state.userMap, [id]: user },
        loading: false,
      }));

      return user;
    } catch (error) {
      console.error("Failed to fetch user by ID:", error);
      set({ loading: false });
      return null;
    }
  },
}));
