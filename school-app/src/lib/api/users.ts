// lib/api/users.ts
export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  deletedAt?: string | null;

  // Optional relations
  memberships?: { id: number; schoolSessionId: number; role: string; active: boolean }[];
  students?: { id: number; fullName: string }[];
  [key: string]: any;
}

const BASE_URL = "/api/users";

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
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    sortOrder,
  });

  if (role) params.append("role", role);
  if (email) params.append("email", email);
  if (fullName) params.append("fullName", fullName);

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json(); // { data: User[], meta: { page, pageSize, total } }
}

// --- Get user by ID ---
export async function apiGetUserById(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json(); // { data: User }
}

// --- Create user ---
export async function apiCreateUser(user: Partial<User>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json(); // { data: User }
}

// --- Update user ---
export async function apiUpdateUser(id: number, user: Partial<User>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json(); // { data: User }
}

// --- Delete user ---
export async function apiDeleteUser(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json(); // { data: { id, deletedAt } }
}
