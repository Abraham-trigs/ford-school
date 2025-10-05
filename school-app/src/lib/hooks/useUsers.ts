"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  apiGetUsers,
  apiGetUserById,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  User,
} from "@/lib/api/users";

/* ---------------------------
   ✅ useUsers
   Fetch paginated list of users
--------------------------- */
export function useUsers(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: string;
  email?: string;
  fullName?: string;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => apiGetUsers(params || {}),
    staleTime: 1000 * 60 * 2, // 2 min caching
    refetchOnWindowFocus: false,
  });
}

/* ---------------------------
   ✅ useUser
   Fetch a single user by ID
--------------------------- */
export function useUser(id?: number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => apiGetUserById(id!),
    enabled: !!id, // only run when id is provided
    staleTime: 1000 * 60 * 5,
  });
}

/* ---------------------------
   ✅ useCreateUser
   Create a new user
--------------------------- */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: Partial<User>) => apiCreateUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/* ---------------------------
   ✅ useUpdateUser
   Update existing user
--------------------------- */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      apiUpdateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
}

/* ---------------------------
   ✅ useDeleteUser
   Soft-delete a user
--------------------------- */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
