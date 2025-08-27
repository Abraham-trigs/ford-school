import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Class, Student } from "@/types/users";

// Simple debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

interface UserStore {
  users: User[];
  filteredUsers: User[];
  classes: Class[];
  filteredClasses: Class[];
  students: Student[];
  filteredStudents: Student[];

  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | undefined>;
  searchUsers: (query: string) => void;
  resetUsersSearch: () => void;

  fetchClasses: () => Promise<void>;
  fetchClassById: (id: string) => Promise<Class | undefined>;
  searchClasses: (query: string) => void;
  resetClassesSearch: () => void;

  fetchStudents: () => Promise<void>;
  fetchStudentById: (id: string) => Promise<Student | undefined>;
  searchStudents: (query: string) => void;
  resetStudentsSearch: () => void;

  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addClass: (cls: Omit<Class, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateClass: (id: string, data: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  addStudent: (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      filteredUsers: [],
      classes: [],
      filteredClasses: [],
      students: [],
      filteredStudents: [],

      // ---------------- Fetch ----------------
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

      searchUsers: debounce((query: string) => {
        const filtered = get().users.filter(u =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        );
        set({ filteredUsers: filtered });
      }, 300),

      resetUsersSearch: () => {
        set({ filteredUsers: [...get().users] });
      },

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

      searchClasses: debounce((query: string) => {
        const filtered = get().classes.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase())
        );
        set({ filteredClasses: filtered });
      }, 300),

      resetClassesSearch: () => {
        set({ filteredClasses: [...get().classes] });
      },

      fetchStudents: async () => {
        try {
          const res = await fetch("/api/students");
          if (!res.ok) throw new Error("Failed to fetch students");
          const data: Student[] = await res.json();
          set({ students: data, filteredStudents: data });
        } catch (err) {
          console.error("fetchStudents error:", err);
        }
      },

      fetchStudentById: async (id) => {
        await get().fetchStudents();
        return get().students.find(s => s.id === id);
      },

      searchStudents: debounce((query: string) => {
        const filtered = get().students.filter(s =>
          s.firstName.toLowerCase().includes(query.toLowerCase()) ||
          s.lastName.toLowerCase().includes(query.toLowerCase())
        );
        set({ filteredStudents: filtered });
      }, 300),

      resetStudentsSearch: () => {
        set({ filteredStudents: [...get().students] });
      },

      // ---------------- Users CRUD ----------------
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

      // ---------------- Classes CRUD ----------------
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

      // ---------------- Students CRUD ----------------
      addStudent: async (student) => {
        try {
          const res = await fetch("/api/students", {
            method: "POST",
            body: JSON.stringify(student),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to add student");
          const newStudent: Student = await res.json();
          set({
            students: [...get().students, newStudent],
            filteredStudents: [...get().filteredStudents, newStudent],
          });
        } catch (err) {
          console.error("addStudent error:", err);
        }
      },

      updateStudent: async (id, data) => {
        try {
          const res = await fetch(`/api/students/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("Failed to update student");
          const updated: Student = await res.json();
          set({
            students: get().students.map(s => s.id === id ? updated : s),
            filteredStudents: get().filteredStudents.map(s => s.id === id ? updated : s),
          });
        } catch (err) {
          console.error("updateStudent error:", err);
        }
      },

      deleteStudent: async (id) => {
        try {
          const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete student");
          set({
            students: get().students.filter(s => s.id !== id),
            filteredStudents: get().filteredStudents.filter(s => s.id !== id),
          });
        } catch (err) {
          console.error("deleteStudent error:", err);
        }
      },
    }),
    {
      name: "user-store", // localStorage key
      partialize: (state) => ({
        users: state.users,
        filteredUsers: state.filteredUsers,
        classes: state.classes,
        filteredClasses: state.filteredClasses,
        students: state.students,
        filteredStudents: state.filteredStudents,
      }),
    }
  )
);
