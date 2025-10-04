import { create } from "zustand";
import { apiGetStaff, apiGetStaffById } from "@/lib/api/staff";

export interface Staff {
  id: number;
  userId: number;
  role: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
    memberships?: any[];
  };
  deletedAt?: string | null;
  [key: string]: any;
}

interface StaffState {
  staffList: Staff[];
  staffMap: Record<number, Staff>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: { name?: string; email?: string; role?: string; schoolSessionId?: number };
  sort: { field: "fullName" | "createdAt"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ name: string; email: string; role: string; schoolSessionId: number }>) => void;
  setSort: (sort: { field: "fullName" | "createdAt"; direction: "asc" | "desc" }) => void;

  fetchStaff: () => Promise<void>;
  fetchStaffById: (id: number) => Promise<Staff | null>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staffList: [],
  staffMap: {},
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

  fetchStaff: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetStaff({
        page,
        pageSize,
        name: filter.name,
        email: filter.email,
        role: filter.role,
        schoolSessionId: filter.schoolSessionId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Staff> = {};
      data.forEach((s: Staff) => (map[s.id] = s));

      set({
        staffList: data,
        staffMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchStaffById: async (id: number) => {
    const cached = get().staffMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const staff = await apiGetStaffById(id);
      set(state => ({
        staffMap: { ...state.staffMap, [id]: staff },
        loading: false,
      }));
      return staff;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
