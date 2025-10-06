"use server";

import { NextRequest } from "next/server";

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
    totalPages?: number;
  };
}

/* ------------------------- Base URL ------------------------- */
function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // client: relative URL
  // server: absolute URL
  const host = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${host}/api/users`;
}

const BASE_URL = getBaseUrl();

/* ------------------------- Response Handler ------------------------- */
async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "API request failed");
  return json;
}

/* ------------------------- API Methods ------------------------- */

export async function apiGetUsers({
  page = 1,
  pageSize = 20,
  sortField = "createdAt",
  sortDirection = "desc",
  role,
  search,
  req, // optional NextRequest for SSR
}: {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  search?: string;
  req?: NextRequest;
}): Promise<ApiResponse<User[]>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: sortField,
    sortOrder: sortDirection,
  });
  if (role) params.append("role", role);
  if (search) params.append("search", search);

  const headers: HeadersInit = {};
  if (req) headers["cookie"] = req.headers.get("cookie") || "";

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  return handleResponse<User[]>(res);
}

export async function apiGetUserById(
  id: number,
  req?: NextRequest
): Promise<ApiResponse<User>> {
  const headers: HeadersInit = {};
  if (req) headers["cookie"] = req.headers.get("cookie") || "";

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  return handleResponse<User>(res);
}

export async function apiCreateUser(
  user: Partial<User>,
  req?: NextRequest
): Promise<ApiResponse<User>> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (req) headers["cookie"] = req.headers.get("cookie") || "";

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(user),
  });

  return handleResponse<User>(res);
}

export async function apiUpdateUser(
  id: number,
  user: Partial<User> & { profileData?: Record<string, any>; schoolSessionId?: number },
  req?: NextRequest
): Promise<ApiResponse<User>> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (req) headers["cookie"] = req.headers.get("cookie") || "";

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(user),
  });

  return handleResponse<User>(res);
}

export async function apiDeleteUser(
  id: number,
  req?: NextRequest
): Promise<ApiResponse<{ id: number; deletedAt: string }>> {
  const headers: HeadersInit = {};
  if (req) headers["cookie"] = req.headers.get("cookie") || "";

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  return handleResponse<{ id: number; deletedAt: string }>(res);
}
