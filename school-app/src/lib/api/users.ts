"use server";

import "server-only";

export interface UserMembership {
  id: number;
  schoolSessionId: number;
  role: string;
  active: boolean;
}

export interface UserProfile {
  [key: string]: any;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  deletedAt?: string | null;
  profilePicture?: string | null;

  memberships?: UserMembership[];
  studentProfile?: UserProfile | null;
  teacherProfile?: UserProfile | null;
  staffProfile?: UserProfile | null;
  parentProfile?: UserProfile | null;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`
  : `${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : ""}/api/users`;

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "API request failed");
  return json;
}

/* ------------------------- Updated Get Users ------------------------- */
export async function apiGetUsers({
  page = 1,
  pageSize = 20,
  sortField = "createdAt",
  sortDirection = "desc",
  role,
  search,
}: {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  search?: string;
}): Promise<ApiResponse<User[]>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: sortField,
    sortOrder: sortDirection,
  });

  if (role) params.append("role", role);
  if (search) {
    // Search both fullName and email on backend
    params.append("search", search);
  }

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    next: { tags: ["users"] },
  });

  return handleResponse<User[]>(res);
}

/* ------------------------- Other CRUD operations remain unchanged ------------------------- */
export async function apiGetUserById(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
    next: { tags: [`user-${id}`] },
  });
  return handleResponse<User>(res);
}

export async function apiCreateUser(user: Partial<User>): Promise<ApiResponse<User>> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  return handleResponse<User>(res);
}

export async function apiUpdateUser(
  id: number,
  user: Partial<User> & { profileData?: Record<string, any>; schoolSessionId?: number }
): Promise<ApiResponse<User>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  return handleResponse<User>(res);
}

export async function apiDeleteUser(
  id: number
): Promise<ApiResponse<{ id: number; deletedAt: string }>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ id: number; deletedAt: string }>(res);
}
