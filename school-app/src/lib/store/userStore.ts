import { create } from "zustand";
import type { User, Class, Attendance, SchoolRole, AttendanceStatus } from "@/types/users";

// ---------------- Debounce helper ----------------
function debounceString(fn: (arg: string) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (arg: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(arg), delay);
  };
}

interface UserStore {
  users: User[];
  filteredUsers: User[];
  classes: Class[];
  filteredClasses: Class[];
  attendances: Attendance[];
  
  // Fetch Users
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | undefined>;
  searchUsers: (query: string) => void;
  resetUsersSearch: () => void;

  // Users CRUD
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Class Fetch & CRUD
  fetchClasses: () => Promise<void>;
  fetchClassById: (id: string) => Promise<Class | undefined>;
  searchClasses: (query: string) => void;
  resetClassesSearch: () => void;
  addClass: (cls: Omit<Class, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateClass: (id: string, data: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // Attendance
  fetchAttendance: () => Promise<void>;
  addAttendance: (record: Omit<Attendance, "id" | "createdAt">) => Promise<void>;
  updateAttendance: (id: string, data: Partial<Attendance>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;

  // Helpers for relations
  getStudents: () => User[];
  getTeachers: () => User[];
  getClassesForTeacher: (teacherId: string) => Class[];
  getChildrenForParent: (parentId: string) => User[];
  getStudentsForClass: (classId: string) => User[];
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  filteredUsers: [],
  classes: [],
  filteredClasses: [],
  attendances: [],

  // ---------------- Users ----------------
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      set({ users: data, filteredUsers: data });
    } catch (err) {
      console.error("fetchUsers error:", err);
    }
  },

  fetchUserById: async (id) => {
    await get().fetchUsers();
    return get().users.find(u => u.id === id);
  },

  searchUsers: debounceString((query: string) => {
    const filtered = get().users.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    );
    set({ filteredUsers: filtered });
  }, 300),

  resetUsersSearch: () => {
    set({ filteredUsers: [...get().users] });
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
      set({
        users: [...get().users, newUser],
        filteredUsers: [...get().filteredUsers, newUser],
      });
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
      set({
        users: get().users.map(u => u.id === id ? updated : u),
        filteredUsers: get().filteredUsers.map(u => u.id === id ? updated : u),
      });
    } catch (err) {
      console.error("updateUser error:", err);
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      set({
        users: get().users.filter(u => u.id !== id),
        filteredUsers: get().filteredUsers.filter(u => u.id !== id),
      });
    } catch (err) {
      console.error("deleteUser error:", err);
    }
  },

  // ---------------- Classes ----------------
  fetchClasses: async () => {
    try {
      const res = await fetch("/api/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data: Class[] = await res.json();
      set({ classes: data, filteredClasses: data });
    } catch (err) {
      console.error("fetchClasses error:", err);
    }
  },

  fetchClassById: async (id) => {
    await get().fetchClasses();
    return get().classes.find(c => c.id === id);
  },

  searchClasses: debounceString((query: string) => {
    const filtered = get().classes.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    set({ filteredClasses: filtered });
  }, 300),

  resetClassesSearch: () => {
    set({ filteredClasses: [...get().classes] });
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
      set({
        classes: [...get().classes, newClass],
        filteredClasses: [...get().filteredClasses, newClass],
      });
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
      set({
        classes: get().classes.map(c => c.id === id ? updated : c),
        filteredClasses: get().filteredClasses.map(c => c.id === id ? updated : c),
      });
    } catch (err) {
      console.error("updateClass error:", err);
    }
  },

  deleteClass: async (id) => {
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete class");
      set({
        classes: get().classes.filter(c => c.id !== id),
        filteredClasses: get().filteredClasses.filter(c => c.id !== id),
      });
    } catch (err) {
      console.error("deleteClass error:", err);
    }
  },

  // ---------------- Attendance ----------------
  fetchAttendance: async () => {
    try {
      const res = await fetch("/api/attendance");
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data: Attendance[] = await res.json();
      set({ attendances: data });
    } catch (err) {
      console.error("fetchAttendance error:", err);
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
      set({ attendances: [...get().attendances, newRecord] });
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
      set({
        attendances: get().attendances.map(a => a.id === id ? updated : a),
      });
    } catch (err) {
      console.error("updateAttendance error:", err);
    }
  },

  deleteAttendance: async (id) => {
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete attendance");
      set({
        attendances: get().attendances.filter(a => a.id !== id),
      });
    } catch (err) {
      console.error("deleteAttendance error:", err);
    }
  },

  // ---------------- Relation Helpers ----------------
  getStudents: () => get().users.filter(u => u.role === "STUDENT"),
  getTeachers: () => get().users.filter(u => u.role === "TEACHER"),
  getClassesForTeacher: (teacherId) => get().classes.filter(c => c.teacherId === teacherId),
  getChildrenForParent: (parentId) => get().users.filter(u => u.parentId === parentId),
  getStudentsForClass: (classId) => {
    const cls = get().classes.find(c => c.id === classId);
    return cls ? get().users.filter(u => cls.students.includes(u)) : [];
  },
}));
