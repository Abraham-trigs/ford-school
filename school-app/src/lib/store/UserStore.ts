"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/school";
import { Role } from "@/types/school";
import { useSessionStore } from "@/lib/store/sessionStore";

interface UsersStore {
  userMap: Record<string, User>;
  userIds: string[];
  totalUsers: number;
  userLoading: boolean;

  students: User[];
  teachers: User[];
  parents: User[];
  staff: User[];
  secretaries: User[];
  accountants: User[];
  librarians: User[];
  counselors: User[];
  nurses: User[];
  cleaners: User[];
  janitors: User[];
  cooks: User[];
  kitchenAssistants: User[];

  fetchUsersIfAllowed: () => Promise<void>;
  addUser: (user: NewUserPayload) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  childrenForParent: (parentId: string) => User[];
  studentsForTeacher: (teacherId: string) => User[];
}

interface NewUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set, get) => {
      const recomputeDerived = (userMap: Record<string, User>, total: number) => {
        const allUsers = Object.values(userMap);
        return {
          userMap,
          userIds: allUsers.map((u) => u.id),
          totalUsers: total,
          students: allUsers.filter((u) => u.role === Role.STUDENT),
          teachers: allUsers.filter((u) => u.role === Role.TEACHER),
          parents: allUsers.filter((u) => u.role === Role.PARENT),
          staff: allUsers.filter((u) =>
            [
              Role.TEACHER,
              Role.SECRETARY,
              Role.ACCOUNTANT,
              Role.LIBRARIAN,
              Role.COUNSELOR,
              Role.NURSE,
              Role.CLEANER,
              Role.JANITOR,
              Role.COOK,
              Role.KITCHEN_ASSISTANT,
            ].includes(u.role)
          ),
          secretaries: allUsers.filter((u) => u.role === Role.SECRETARY),
          accountants: allUsers.filter((u) => u.role === Role.ACCOUNTANT),
          librarians: allUsers.filter((u) => u.role === Role.LIBRARIAN),
          counselors: allUsers.filter((u) => u.role === Role.COUNSELOR),
          nurses: allUsers.filter((u) => u.role === Role.NURSE),
          cleaners: allUsers.filter((u) => u.role === Role.CLEANER),
          janitors: allUsers.filter((u) => u.role === Role.JANITOR),
          cooks: allUsers.filter((u) => u.role === Role.COOK),
          kitchenAssistants: allUsers.filter((u) => u.role === Role.KITCHEN_ASSISTANT),
        };
      };

      return {
        userMap: {},
        userIds: [],
        totalUsers: 0,
        userLoading: false,

        students: [],
        teachers: [],
        parents: [],
        staff: [],
        secretaries: [],
        accountants: [],
        librarians: [],
        counselors: [],
        nurses: [],
        cleaners: [],
        janitors: [],
        cooks: [],
        kitchenAssistants: [],

        // ---------------- FETCH USERS ----------------
        fetchUsersIfAllowed: async () => {
          const caller = useSessionStore.getState().user;
          if (!caller) return;

          set({ userLoading: true });

          try {
            const queryParams: string[] = [];

            switch (caller.role) {
              case Role.SUPERADMIN:
                break;
              case Role.ADMIN:
                queryParams.push(
                  `roles=${[
                    Role.ADMIN,
                    Role.TEACHER,
                    Role.SECRETARY,
                    Role.ACCOUNTANT,
                    Role.LIBRARIAN,
                    Role.COUNSELOR,
                    Role.NURSE,
                    Role.CLEANER,
                    Role.JANITOR,
                    Role.COOK,
                    Role.KITCHEN_ASSISTANT,
                    Role.STUDENT,
                    Role.PARENT,
                  ].join(",")}`
                );
                break;
              case Role.SECRETARY:
                queryParams.push(
                  `roles=${[
                    Role.TEACHER,
                    Role.SECRETARY,
                    Role.ACCOUNTANT,
                    Role.LIBRARIAN,
                    Role.COUNSELOR,
                    Role.STUDENT,
                    Role.PARENT,
                  ].join(",")}`
                );
                break;
              case Role.TEACHER:
                queryParams.push(`roles=${Role.STUDENT}`);
                break;
              case Role.ACCOUNTANT:
              case Role.LIBRARIAN:
              case Role.COUNSELOR:
                queryParams.push(`roles=${[Role.STUDENT, Role.PARENT].join(",")}`);
                break;
              case Role.STUDENT:
                queryParams.push(`ids=${caller.id}`);
                break;
              case Role.PARENT:
                const childrenIds = caller.children?.map((c) => c.id).join(",");
                if (childrenIds) queryParams.push(`ids=${childrenIds}`);
                break;
              default:
                set({ userLoading: false });
                return;
            }

            const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
            const res = await fetch(`/api/users${queryString}`, {
              credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch users");

            const data = (await res.json()) as { users: User[]; total: number };
            const userMap: Record<string, User> = {};
            data.users.forEach((u) => {
              userMap[u.id] = u;
            });

            set(recomputeDerived(userMap, data.total));
          } catch (err) {
            console.error("fetchUsersIfAllowed error:", err);
          } finally {
            set({ userLoading: false });
          }
        },

        // ---------------- ADD USER ----------------
        addUser: async (user: NewUserPayload) => {
          try {
            const res = await fetch("/api/users", {
              method: "POST",
              body: JSON.stringify(user),
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to add user");

            await get().fetchUsersIfAllowed();
          } catch (err) {
            console.error("addUser error:", err);
          }
        },

        // ---------------- UPDATE USER ----------------
        updateUser: async (id, data) => {
          try {
            const res = await fetch(`/api/users/${id}`, {
              method: "PUT",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to update user");

            await get().fetchUsersIfAllowed();
          } catch (err) {
            console.error("updateUser error:", err);
          }
        },

        // ---------------- DELETE USER ----------------
        deleteUser: async (id) => {
          try {
            const res = await fetch(`/api/users/${id}`, {
              method: "DELETE",
              credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete user");

            await get().fetchUsersIfAllowed();
          } catch (err) {
            console.error("deleteUser error:", err);
          }
        },

        // ---------------- DERIVED RELATIONS ----------------
        childrenForParent: (parentId) => {
          const state = get();
          return Object.values(state.userMap).filter((u) => u.parentId === parentId);
        },
        studentsForTeacher: (teacherId) => {
          const state = get();
          return Object.values(state.userMap).filter((u) => u.teacherId === teacherId);
        },
      };
    },
    {
      name: "users-store",
      getStorage: () => localStorage,
    }
  )
);
