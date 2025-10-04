import { create } from "zustand";
import { apiGetAssignments, apiGetAssignmentById } from "@/lib/api/assignments";

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  classroomId: number;
  courseId: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  grades?: { studentId: number; grade: number }[];
  [key: string]: any;
}

interface AssignmentState {
  assignmentList: Assignment[];
  assignmentMap: Record<number, Assignment>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    classroomId?: number;
    courseId?: number;
    studentId?: number;
    title?: string;
  };
  sort: { field: "createdAt" | "dueDate" | "title"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<AssignmentState["filter"]>) => void;
  setSort: (sort: AssignmentState["sort"]) => void;

  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: number) => Promise<Assignment | null>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignmentList: [],
  assignmentMap: {},
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

  fetchAssignments: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetAssignments({
        page,
        pageSize,
        classroomId: filter.classroomId,
        courseId: filter.courseId,
        studentId: filter.studentId,
        title: filter.title,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Assignment> = {};
      data.forEach((a: Assignment) => (map[a.id] = a));

      set({
        assignmentList: data,
        assignmentMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchAssignmentById: async (id: number) => {
    const cached = get().assignmentMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const assignment = await apiGetAssignmentById(id);
      set(state => ({
        assignmentMap: { ...state.assignmentMap, [id]: assignment },
        loading: false,
      }));
      return assignment;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
