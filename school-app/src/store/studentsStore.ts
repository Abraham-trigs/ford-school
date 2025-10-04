import { create } from "zustand";
import { apiGetStudents, apiGetStudentById } from "@/lib/api/students";

export interface Student {
  id: number;
  userId: number;
  classroomId: number;
  user: {
    id: number;
    fullName: string;
    email?: string;
    profilePicture?: string;
    memberships?: any[];
  };
  deletedAt?: string | null;
  [key: string]: any;
}

interface StudentState {
  studentList: Student[];
  studentMap: Record<number, Student>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    name?: string;
    classroomId?: number;
    schoolSessionId?: number;
    courseId?: number;
  };
  sort: { field: "fullName" | "createdAt"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ name: string; classroomId: number; schoolSessionId: number; courseId: number }>) => void;
  setSort: (sort: { field: "fullName" | "createdAt"; direction: "asc" | "desc" }) => void;

  fetchStudents: () => Promise<void>;
  fetchStudentById: (id: number) => Promise<Student | null>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  studentList: [],
  studentMap: {},
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

  fetchStudents: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetStudents({
        page,
        pageSize,
        name: filter.name,
        classroomId: filter.classroomId,
        schoolSessionId: filter.schoolSessionId,
        courseId: filter.courseId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Student> = {};
      data.forEach((s: Student) => (map[s.id] = s));

      set({
        studentList: data,
        studentMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchStudentById: async (id: number) => {
    const cached = get().studentMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const student = await apiGetStudentById(id);
      set(state => ({
        studentMap: { ...state.studentMap, [id]: student },
        loading: false,
      }));
      return student;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
