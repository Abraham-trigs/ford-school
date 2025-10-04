import { create } from "zustand";
import { apiGetGrades, apiGetGradeById } from "@/lib/api/grades";

export interface Grade {
  id: number;
  assignmentId: number;
  studentId: number;
  score: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface GradesState {
  gradeList: Grade[];
  gradeMap: Record<number, Grade>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    assignmentId?: number;
    studentId?: number;
    classroomId?: number;
  };
  sort: { field: "score" | "createdAt"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<GradesState["filter"]>) => void;
  setSort: (sort: GradesState["sort"]) => void;

  fetchGrades: () => Promise<void>;
  fetchGradeById: (id: number) => Promise<Grade | null>;
}

export const useGradesStore = create<GradesState>((set, get) => ({
  gradeList: [],
  gradeMap: {},
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

  fetchGrades: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetGrades({
        page,
        pageSize,
        assignmentId: filter.assignmentId,
        studentId: filter.studentId,
        classroomId: filter.classroomId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Grade> = {};
      data.forEach((g: Grade) => (map[g.id] = g));

      set({
        gradeList: data,
        gradeMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchGradeById: async (id: number) => {
    const cached = get().gradeMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const grade = await apiGetGradeById(id);
      set(state => ({
        gradeMap: { ...state.gradeMap, [id]: grade },
        loading: false,
      }));
      return grade;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
