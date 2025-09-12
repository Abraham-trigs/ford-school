"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Class, Attendance, UserRole } from "@/types/school";

interface SchoolStore {
  // ---------------- State ----------------
  usersMap: Record<string, User>;
  userIds: string[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  usersLoading: boolean;

  classesMap: Record<string, Class>;
  classIds: string[];
  classesLoading: boolean;

  attendancesMap: Record<string, Attendance>;
  attendanceIds: string[];
  attendancesLoading: boolean;

  // ---------------- Users ----------------
  fetchUsers: (page?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // ---------------- Classes ----------------
  fetchClasses: () => Promise<void>;
  fetchTeacherClasses: (teacherId: string) => Promise<void>;
  addClass: (cls: Omit<Class, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateClass: (id: string, data: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // ---------------- Attendance ----------------
  fetchAttendance: () => Promise<void>;
  addAttendance: (record: Omit<Attendance, "id" | "createdAt">) => Promise<void>;
  updateAttendance: (id: string, data: Partial<Attendance>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;

  // ---------------- Attendance helpers ----------------
  getAttendanceByDate: (date: string) => Attendance[];
  getLatestAttendanceDate: () => string | null;

  // ---------------- Relation helpers ----------------
  getStudents: () => User[];
  getTeachers: () => User[];
  getClassesForTeacher: (teacherId: string) => Class[];
  getChildrenForParent: (parentId: string) => User[];
  getStudentsForClass: (classId: string) => User[];
}

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set, get) => ({
      usersMap: {},
      userIds: [],
      totalUsers: 0,
      currentPage: 1,
      pageSize: 50,
      usersLoading: false,

      classesMap: {},
      classIds: [],
      classesLoading: false,

      attendancesMap: {},
      attendanceIds: [],
      attendancesLoading: false,

      // ---------------- Users ----------------
      fetchUsers: async (page = 1) => {
        set({ usersLoading: true });
        try {
          const res = await fetch(`/api/users?page=${page}&limit=${get().pageSize}`);
          if (!res.ok) throw new Error("Failed to fetch users");
          const data: { users: User[]; total: number } = await res.json();
          const usersMap: Record<string, User> = {};
          const userIds: string[] = [];
          data.users.forEach((u) => {
            usersMap[u.id] = u;
            userIds.push(u.id);
          });
          set({
            usersMap,
            userIds,
            totalUsers: data.total,
            currentPage: page,
          });
        } catch (err) {
          console.error("fetchUsers error:", err);
        } finally {
          set({ usersLoading: false });
        }
      },

      searchUsers: async (query: string) => {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(query)}&limit=${get().pageSize}`
        );
        if (!res.ok) throw new Error("Failed to search users");
        const data: { users: User[]; total: number } = await res.json();
        return data.users;
      },

      addUser: async (user) => {
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(user),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to add user");
          const newUser: User = await res.json();
          set((state) => ({
            usersMap: { ...state.usersMap, [newUser.id]: newUser },
            userIds: [newUser.id, ...state.userIds],
            totalUsers: state.totalUsers + 1,
          }));
        } catch (err) {
          console.error("addUser error:", err);
        }
      },

      updateUser: async (id, data) => {
        try {
          const res = await fetch(`/api/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to update user");
          const updated: User = await res.json();
          set((state) => ({ usersMap: { ...state.usersMap, [id]: updated } }));
        } catch (err) {
          console.error("updateUser error:", err);
        }
      },

      deleteUser: async (id) => {
        try {
          const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete user");
          set((state) => {
            const { [id]: _, ...usersMap } = state.usersMap;
            return {
              usersMap,
              userIds: state.userIds.filter((uid) => uid !== id),
              totalUsers: state.totalUsers - 1,
            };
          });
        } catch (err) {
          console.error("deleteUser error:", err);
        }
      },

      // ---------------- Classes ----------------
      fetchClasses: async () => {
        set({ classesLoading: true });
        try {
          const res = await fetch("/api/classes");
          if (!res.ok) throw new Error("Failed to fetch classes");
          const data: Class[] = await res.json();
          const classesMap: Record<string, Class> = {};
          const classIds: string[] = [];
          data.forEach((c) => {
            classesMap[c.id] = c;
            classIds.push(c.id);
          });
          set({ classesMap, classIds });
        } catch (err) {
          console.error("fetchClasses error:", err);
        } finally {
          set({ classesLoading: false });
        }
      },

      fetchTeacherClasses: async (teacherId: string) => {
        set({ classesLoading: true });
        try {
          const res = await fetch(`/api/classes?teacherId=${teacherId}`);
          if (!res.ok) throw new Error("Failed to fetch teacher classes");
          const data: Class[] = await res.json();
          const classesMap: Record<string, Class> = {};
          const classIds: string[] = [];
          data.forEach((c) => {
            classesMap[c.id] = c;
            classIds.push(c.id);
          });
          set({ classesMap, classIds });
        } catch (err) {
          console.error("fetchTeacherClasses error:", err);
        } finally {
          set({ classesLoading: false });
        }
      },

      addClass: async (cls) => {
        try {
          const res = await fetch("/api/classes", {
            method: "POST",
            body: JSON.stringify(cls),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to add class");
          const newClass: Class = await res.json();
          set((state) => ({
            classesMap: { ...state.classesMap, [newClass.id]: newClass },
            classIds: [...state.classIds, newClass.id],
          }));
        } catch (err) {
          console.error("addClass error:", err);
        }
      },

      updateClass: async (id, data) => {
        try {
          const res = await fetch(`/api/classes/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to update class");
          const updated: Class = await res.json();
          set((state) => ({ classesMap: { ...state.classesMap, [id]: updated } }));
        } catch (err) {
          console.error("updateClass error:", err);
        }
      },

      deleteClass: async (id) => {
        try {
          const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete class");
          set((state) => {
            const { [id]: _, ...classesMap } = state.classesMap;
            return { classesMap, classIds: state.classIds.filter((cid) => cid !== id) };
          });
        } catch (err) {
          console.error("deleteClass error:", err);
        }
      },

      // ---------------- Attendance ----------------
      fetchAttendance: async () => {
        set({ attendancesLoading: true });
        try {
          const res = await fetch("/api/attendance");
          if (!res.ok) throw new Error("Failed to fetch attendance");
          const data: Attendance[] = await res.json();
          const attendancesMap: Record<string, Attendance> = {};
          const attendanceIds: string[] = [];
          data.forEach((a) => {
            attendancesMap[a.id] = a;
            attendanceIds.push(a.id);
          });
          set({ attendancesMap, attendanceIds });
        } catch (err) {
          console.error("fetchAttendance error:", err);
        } finally {
          set({ attendancesLoading: false });
        }
      },

      addAttendance: async (record) => {
        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            body: JSON.stringify(record),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to add attendance");
          const newRecord: Attendance = await res.json();
          set((state) => ({
            attendancesMap: { ...state.attendancesMap, [newRecord.id]: newRecord },
            attendanceIds: [...state.attendanceIds, newRecord.id],
          }));
        } catch (err) {
          console.error("addAttendance error:", err);
        }
      },

      updateAttendance: async (id, data) => {
        try {
          const res = await fetch(`/api/attendance/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to update attendance");
          const updated: Attendance = await res.json();
          set((state) => ({ attendancesMap: { ...state.attendancesMap, [id]: updated } }));
        } catch (err) {
          console.error("updateAttendance error:", err);
        }
      },

      deleteAttendance: async (id) => {
        try {
          const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete attendance");
          set((state) => {
            const { [id]: _, ...attendancesMap } = state.attendancesMap;
            return {
              attendancesMap,
              attendanceIds: state.attendanceIds.filter((aid) => aid !== id),
            };
          });
        } catch (err) {
          console.error("deleteAttendance error:", err);
        }
      },

      // ---------------- Attendance helpers ----------------
      getAttendanceByDate: (date: string) => {
        return get()
          .attendanceIds.map((id) => get().attendancesMap[id])
          .filter((a) => a.date.split("T")[0] === date);
      },
      getLatestAttendanceDate: () => {
        if (!get().attendanceIds.length) return null;
        const dates = get()
          .attendanceIds.map((id) => get().attendancesMap[id].date.split("T")[0])
          .sort();
        return dates[dates.length - 1];
      },

      // ---------------- Relation helpers ----------------
      getStudents: () => Object.values(get().usersMap).filter((u) => u.role === UserRole.STUDENT),
      getTeachers: () => Object.values(get().usersMap).filter((u) => u.role === UserRole.TEACHER),
      getClassesForTeacher: (teacherId) =>
        Object.values(get().classesMap).filter((c) => c.teacherId === teacherId),
      getChildrenForParent: (parentId) =>
        Object.values(get().usersMap).filter((u) => u.parentId === parentId),
      getStudentsForClass: (classId) => {
        const cls = get().classesMap[classId];
        if (!cls) return [];
        return Object.values(get().usersMap).filter(
          (u) => u.role === UserRole.STUDENT && u.classesAttended?.some((c) => c.id === classId)
        );
      },
    }),
    {
      name: "school-store",
      getStorage: () => localStorage,
    }
  )
);
