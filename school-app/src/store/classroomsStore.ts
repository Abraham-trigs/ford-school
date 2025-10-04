import { create } from "zustand";
import { apiGetClassrooms, apiGetClassroomById } from "@/lib/api/classrooms";

export interface Classroom {
  id: number;
  name: string;
  teacherId?: number;
  schoolSessionId: number;
  createdAt: string;
  updatedAt: string;
  students?: { id: number; fullName: string }[];
  courses?: { id: number; name: string }[];
  [key: string]: any;
}

interface ClassroomState {
  classroomList: Classroom[];
  classroomMap: Record<number, Classroom>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    name?: string;
    teacherId?: number;
    schoolSessionId?: number;
  };
  sort: { field: "createdAt" | "name"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ name: string; teacherId: number; schoolSessionId: number }>) => void;
  setSort: (sort: { field: "createdAt" | "name"; direction: "asc" | "desc" }) => void;

  fetchClassrooms: () => Promise<void>;
  fetchClassroomById: (id: number) => Promise<Classroom | null>;
}

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  classroomList: [],
  classroomMap: {},
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

  fetchClassrooms: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetClassrooms({
        page,
        pageSize,
        name: filter.name,
        teacherId: filter.teacherId,
        schoolSessionId: filter.schoolSessionId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Classroom> = {};
      data.forEach((c: Classroom) => (map[c.id] = c));

      set({
        classroomList: data,
        classroomMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchClassroomById: async (id: number) => {
    const cached = get().classroomMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const classroom = await apiGetClassroomById(id);
      set(state => ({
        classroomMap: { ...state.classroomMap, [id]: classroom },
        loading: false,
      }));
      return classroom;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
