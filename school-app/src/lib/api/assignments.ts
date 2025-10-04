// lib/api/assignments.ts
export interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  classroomId: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

const BASE_URL = "/api/assignments";

// --- Get all assignments (with pagination, filtering, sorting) ---
export async function apiGetAssignments({
  page = 1,
  pageSize = 20,
  search,
  sortField = "createdAt",
  sortDirection = "desc",
  classroomId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  classroomId?: number;
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortField,
    sortDirection,
  });

  if (search) params.append("search", search);
  if (classroomId) params.append("classroomId", classroomId.toString());

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json(); // { data: Assignment[], meta: {...} }
}

// --- Get a single assignment ---
export async function apiGetAssignmentById(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch assignment");
  return res.json(); // { data: Assignment }
}

// --- Create assignment ---
export async function apiCreateAssignment(assignment: Partial<Assignment>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(assignment),
  });
  if (!res.ok) throw new Error("Failed to create assignment");
  return res.json(); // { data: Assignment }
}

// --- Update assignment ---
export async function apiUpdateAssignment(id: number, assignment: Partial<Assignment>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(assignment),
  });
  if (!res.ok) throw new Error("Failed to update assignment");
  return res.json(); // { data: Assignment }
}

// --- Delete assignment ---
export async function apiDeleteAssignment(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete assignment");
  return res.json(); // { data: { id, deletedAt } }
}
