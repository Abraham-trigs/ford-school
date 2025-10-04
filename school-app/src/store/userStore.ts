import { create } from "zustand";
import { apiGetUsers, apiGetUserById } from "@/lib/api/users";

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
  page: number;
  pageSize: number;
  total: number;
  filter: { role?: string; active?: boolean };
  sort: { field: "fullName" | "email" | "createdAt"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<UserState["filter"]>) => void;
  setSort: (sort: UserState["sort"]) => void;

  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
}

export const useUserStore = create<UserState>((set, get) => ({
  userList: [],
  userMap: {},
  loading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  filter: {},
  sort: { field: "fullName", direction: "asc" },

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),

  fetchUsers: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetUsers({
        page,
        pageSize,
        role: filter.role,
        active: filter.active,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, User> = {};
      data.forEach((u: User) => (map[u.id] = u));

      set({
        userList: data,
        userMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchUserById: async (id: number) => {
    const cached = get().userMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const user = await apiGetUserById(id);
      set(state => ({
        userMap: { ...state.userMap, [id]: user },
        loading: false,
      }));
      return user;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
