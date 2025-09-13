"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types/school";

interface UsersStore {
  userMap: Record<string, User>;
  userIds: string[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  userLoading: boolean;

  fetchUsers: (page?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Derived selectors
  students: () => User[];
  teachers: () => User[];
  parents: () => User[];
  childrenForParent: (parentId: string) => User[];
  studentsForTeacher: (teacherId: string) => User[];
  parentsForTeacher: (teacherId: string) => User[];
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set, get) => ({
      userMap: {},
      userIds: [],
      totalUsers: 0,
      currentPage: 1,
      pageSize: 50,
      userLoading: false,

      fetchUsers: async (page = 1) => {
        set({ userLoading: true });
        try {
          const res = await fetch(`/api/users?page=${page}&limit=${get().pageSize}`);
          if (!res.ok) throw new Error("Failed to fetch users");
          const data: { users: User[]; total: number } = await res.json();

          const userMap: Record<string, User> = {};
          const userIds: string[] = [];
          data.users.forEach((u) => {
            userMap[u.id] = u;
            userIds.push(u.id);
          });

          set({ userMap, userIds, totalUsers: data.total, currentPage: page });
        } catch (err) {
          console.error("fetchUsers error:", err);
        } finally {
          set({ userLoading: false });
        }
      },

      searchUsers: async (query) => {
        const res = await fetch(`/api/users?search=${encodeURIComponent(query)}&limit=${get().pageSize}`);
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
            userMap: { ...state.userMap, [newUser.id]: newUser },
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
          set((state) => ({ userMap: { ...state.userMap, [id]: updated } }));
        } catch (err) {
          console.error("updateUser error:", err);
        }
      },

      deleteUser: async (id) => {
        try {
          const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete user");
          set((state) => {
            const { [id]: _, ...userMap } = state.userMap;
            return {
              userMap,
              userIds: state.userIds.filter((uid) => uid !== id),
              totalUsers: state.totalUsers - 1,
            };
          });
        } catch (err) {
          console.error("deleteUser error:", err);
        }
      },

      // Derived selectors
      students: () => Object.values(get().userMap).filter((u) => u.role === UserRole.STUDENT),
      teachers: () => Object.values(get().userMap).filter((u) => u.role === UserRole.TEACHER),
      parents: () => Object.values(get().userMap).filter((u) => u.role === UserRole.PARENT),
      childrenForParent: (parentId) => Object.values(get().userMap).filter((u) => u.parentId === parentId),
      studentsForTeacher: (teacherId) =>
        Object.values(get().userMap).filter((u) => u.teacherClasses?.some((c) => c.teacherId === teacherId)),
      parentsForTeacher: (teacherId) =>
        Object.values(get().userMap)
          .filter((u) => u.teacherClasses?.some((c) => c.teacherId === teacherId))
          .flatMap((u) => u.parents || []),
    }),
    { name: "users-store", getStorage: () => localStorage }
  )
);
