// lib/api/users.ts
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

// --- Utility: handle fetch and unwrap data ---
async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "API request failed");
  return json;
}

// --- Get all users ---
export async function apiGetUsers({
  page = 1,
  pageSize = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
  role,
  email,
  fullName,
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: string;
  email?: string;
  fullName?: string;
}): Promise<ApiResponse<User[]>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortOrder,
  });

  if (role) params.append("role", role);
  if (email) params.append("email", email);
  if (fullName) params.append("fullName", fullName);

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    next: { tags: ["users"] },
  });

  return handleResponse<User[]>(res);
}

// --- Get user by ID ---
export async function apiGetUserById(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
    next: { tags: [`user-${id}`] },
  });
  return handleResponse<User>(res);
}

// --- Create user ---
export async function apiCreateUser(user: Partial<User>): Promise<ApiResponse<User>> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });

  // Optionally revalidate cache
  // revalidateTag("users");

  return handleResponse<User>(res);
}

// --- Update user ---
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

  // Optionally revalidate cache
  // revalidateTag(`user-${id}`);
  // revalidateTag("users");

  return handleResponse<User>(res);
}

// --- Delete (soft-delete) user ---
export async function apiDeleteUser(
  id: number
): Promise<ApiResponse<{ id: number; deletedAt: string }>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  // Optionally revalidate cache
  // revalidateTag("users");

  return handleResponse<{ id: number; deletedAt: string }>(res);
}
