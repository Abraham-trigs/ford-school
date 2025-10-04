import { create } from "zustand";
import { apiGetParents, apiGetParentById } from "@/lib/api/parents";

export interface Parent {
  id: number;
  userId: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
    memberships?: any[];
  };
  students?: any[];
  memberships?: any[];
  deletedAt?: string | null;
  [key: string]: any;
}

interface ParentsState {
  parents: Parent[];
  parentMap: Record<number, Parent>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: { name?: string; email?: string; schoolSessionId?: number };
  sort: { field: "fullName" | "createdAt"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ name: string; email: string; schoolSessionId: number }>) => void;
  setSort: (sort: { field: "fullName" | "createdAt"; direction: "asc" | "desc" }) => void;

  fetchParents: () => Promise<void>;
  fetchParentById: (id: number) => Promise<Parent | null>;
}

export const useParentsStore = create<ParentsState>((set, get) => ({
  parents: [],
  parentMap: {},
  loading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  filter: {},
  sort: { field: "createdAt", direction: "desc" },

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),

  fetchParents: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetParents({
        page,
        pageSize,
        name: filter.name,
        email: filter.email,
        schoolSessionId: filter.schoolSessionId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Parent> = {};
      data.forEach((p: Parent) => (map[p.id] = p));

      set({
        parents: data,
        parentMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchParentById: async (id: number) => {
    const cached = get().parentMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const parent = await apiGetParentById(id);
      set(state => ({
        parentMap: { ...state.parentMap, [id]: parent },
        loading: false,
      }));
      return parent;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
