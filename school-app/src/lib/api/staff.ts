// lib/api/staff.ts
export interface Staff {
  id: number;
  email: string;
  fullName: string;
  role: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;

  // Relations (optional)
  classrooms?: { id: number; name: string }[];
  courses?: { id: number; name: string }[];
  [key: string]: any;
}

const BASE_URL = "/api/staff";

// --- Get all staff ---
export async function apiGetStaff({
  page = 1,
  pageSize = 20,
  includeRelations = true,
  search,
  role,
}: {
  page?: number;
  pageSize?: number;
  includeRelations?: boolean;
  search?: string;
  role?: string;
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    includeRelations: includeRelations ? "1" : "0",
  });

  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch staff");
  return res.json(); // { data: Staff[], meta: { page, pageSize, total } }
}

// --- Get staff by ID ---
export async function apiGetStaffById(id: number, includeRelations = true) {
  const params = includeRelations ? "?includeRelations=1" : "";
  const res = await fetch(`${BASE_URL}/${id}${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch staff");
  return res.json(); // { data: Staff }
}

// --- Create new staff ---
export async function apiCreateStaff(staff: Partial<Staff>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(staff),
  });
  if (!res.ok) throw new Error("Failed to create staff");
  return res.json(); // { data: Staff }
}

// --- Update staff ---
export async function apiUpdateStaff(id: number, staff: Partial<Staff>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(staff),
  });
  if (!res.ok) throw new Error("Failed to update staff");
  return res.json(); // { data: Staff }
}

// --- Delete staff ---
export async function apiDeleteStaff(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete staff");
  return res.json(); // { data: { id, deletedAt } }
}
