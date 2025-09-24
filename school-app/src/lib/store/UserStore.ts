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
  parents: User[];
  staff: User[];

  hasFetchedUsers: boolean;
  setHasFetchedUsesrs: (value: boolean) => void;

  fetchUsersIfAllowed: () => Promise<void>;
  addUser: (user: NewUserPayload) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUsers: () => void;
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
        const staffRoles = Object.values(Role).filter(
          (r) => r !== Role.STUDENT && r !== Role.PARENT
        );

        return {
          userMap,
          userIds: allUsers.map((u) => u.id),
          totalUsers: total,
          students: allUsers.filter((u) => u.role === Role.STUDENT),
          parents: allUsers.filter((u) => u.role === Role.PARENT),
          staff: allUsers.filter((u) => staffRoles.includes(u.role)),
        };
      };

      return {
        userMap: {},
        userIds: [],
        totalUsers: 0,
        userLoading: false,
        students: [],
        parents: [],
        staff: [],
        hasFetchedUsers: false,

        setHasFetchedUsers: (value: boolean) => set({ hasFetchedUsers: value }),

        fetchUsersIfAllowed: async () => {
          if (get().hasFetchedUsers) return;

          const caller = useSessionStore.getState().user;
          if (!caller) return;

          set({ userLoading: true });

          try {
            let queryString = "";

            if (caller.role !== Role.SUPERADMIN) {
              const rolesToFetch: Role[] = [];

              switch (caller.role) {
                case Role.ADMIN:
                  rolesToFetch.push(...Object.values(Role));
                  break;
                case Role.SECRETARY:
                  rolesToFetch.push(
                    Role.TEACHER,
                    Role.SECRETARY,
                    Role.ACCOUNTANT,
                    Role.LIBRARIAN,
                    Role.COUNSELOR,
                    Role.STUDENT,
                    Role.PARENT
                  );
                  break;
                case Role.TEACHER:
                  rolesToFetch.push(Role.STUDENT);
                  break;
                case Role.ACCOUNTANT:
                case Role.LIBRARIAN:
                case Role.COUNSELOR:
                  rolesToFetch.push(Role.STUDENT, Role.PARENT);
                  break;
                case Role.STUDENT:
                  rolesToFetch.push(Role.STUDENT);
                  break;
                case Role.PARENT:
                  const childrenIds = caller.children?.map((c) => c.id).join(",");
                  if (childrenIds) queryString = `?ids=${childrenIds}`;
                  break;
              }

              if (rolesToFetch.length) {
                queryString = `?roles=${rolesToFetch.join(",")}`;
              }
            }

            const res = await fetch(`/api/users${queryString}`, {
              credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch users");

            const data = (await res.json()) as { users: User[]; total: number };
            const userMap: Record<string, User> = {};
            data.users.forEach((u) => {
              userMap[u.id] = u;
            });

            set({
              ...recomputeDerived(userMap, data.total),
              hasFetchedUsers: true,
            });
          } catch (err) {
            console.error("fetchUsersIfAllowed error:", err);
          } finally {
            set({ userLoading: false });
          }
        },

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

        resetUsers: () =>
          set({
            userMap: {},
            userIds: [],
            totalUsers: 0,
            students: [],
            parents: [],
            staff: [],
            hasFetchedUsers: false,
          }),
      };
    },
    {
      name: "users-store",
      getStorage: () => sessionStorage, // persist only per tab session
    }
  )
);
