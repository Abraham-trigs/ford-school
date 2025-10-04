import { create } from "zustand";
import { apiGetCourses, apiGetCourseById } from "@/lib/api/course";

export interface Course {
  id: number;
  name: string;
  description?: string;
  classroomId?: number;
  teacherId?: number;
  schoolSessionId: number;
  createdAt: string;
  updatedAt: string;
  students?: { id: number; fullName: string }[];
  [key: string]: any;
}

interface CourseState {
  courseList: Course[];
  courseMap: Record<number, Course>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    name?: string;
    teacherId?: number;
    classroomId?: number;
    schoolSessionId?: number;
  };
  sort: { field: "createdAt" | "name"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ name: string; teacherId: number; classroomId: number; schoolSessionId: number }>) => void;
  setSort: (sort: { field: "createdAt" | "name"; direction: "asc" | "desc" }) => void;

  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: number) => Promise<Course | null>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courseList: [],
  courseMap: {},
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

  fetchCourses: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetCourses({
        page,
        pageSize,
        name: filter.name,
        teacherId: filter.teacherId,
        classroomId: filter.classroomId,
        schoolSessionId: filter.schoolSessionId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Course> = {};
      data.forEach((c: Course) => (map[c.id] = c));

      set({
        courseList: data,
        courseMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchCourseById: async (id: number) => {
    const cached = get().courseMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const course = await apiGetCourseById(id);
      set(state => ({
        courseMap: { ...state.courseMap, [id]: course },
        loading: false,
      }));
      return course;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
