import { create } from "zustand";
import { apiGetGraduations, apiGetGraduationById } from "@/lib/api/graduations";

export interface Graduation {
  id: number;
  studentId: number;
  schoolSessionId: number;
  date: string;
  honors?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface GraduationState {
  graduationList: Graduation[];
  graduationMap: Record<number, Graduation>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    studentId?: number;
    schoolSessionId?: number;
  };
  sort: { field: "date" | "createdAt"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<GraduationState["filter"]>) => void;
  setSort: (sort: GraduationState["sort"]) => void;

  fetchGraduations: () => Promise<void>;
  fetchGraduationById: (id: number) => Promise<Graduation | null>;
}

export const useGraduationStore = create<GraduationState>((set, get) => ({
  graduationList: [],
  graduationMap: {},
  loading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  filter: {},
  sort: { field: "date", direction: "desc" },

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),

  fetchGraduations: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetGraduations({
        page,
        pageSize,
        studentId: filter.studentId,
        schoolSessionId: filter.schoolSessionId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Graduation> = {};
      data.forEach((g: Graduation) => (map[g.id] = g));

      set({
        graduationList: data,
        graduationMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchGraduationById: async (id: number) => {
    const cached = get().graduationMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const graduation = await apiGetGraduationById(id);
      set(state => ({
        graduationMap: { ...state.graduationMap, [id]: graduation },
        loading: false,
      }));
      return graduation;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
