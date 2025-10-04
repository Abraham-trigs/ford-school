// lib/api/grades.ts
export interface Grade {
  id: number;
  assignmentId: number;
  studentId: number;
  score: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

const BASE_URL = "/api/assignments";

// --- Get grades by assignment (with pagination, filtering, sorting) ---
export async function apiGetGrades({
  assignmentId,
  studentId,
  classroomId,
  page = 1,
  pageSize = 20,
  sortField = "createdAt",
  sortDirection = "desc",
}: {
  assignmentId?: number;
  studentId?: number;
  classroomId?: number;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortField,
    sortDirection,
  });

  if (assignmentId) params.append("assignmentId", assignmentId.toString());
  if (studentId) params.append("studentId", studentId.toString());
  if (classroomId) params.append("classroomId", classroomId.toString());

  const res = await fetch(`${BASE_URL}/grades?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch grades");
  return res.json(); // { data: Grade[], meta: {...} }
}

// --- Get single grade by ID ---
export async function apiGetGradeById(id: number) {
  const res = await fetch(`${BASE_URL}/grades/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch grade");
  return res.json(); // { data: Grade }
}

// --- Create a grade ---
export async function apiCreateGrade(grade: Partial<Grade>) {
  const res = await fetch(`${BASE_URL}/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(grade),
  });
  if (!res.ok) throw new Error("Failed to create grade");
  return res.json(); // { data: Grade }
}

// --- Update a grade ---
export async function apiUpdateGrade(id: number, grade: Partial<Grade>) {
  const res = await fetch(`${BASE_URL}/grades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(grade),
  });
  if (!res.ok) throw new Error("Failed to update grade");
  return res.json(); // { data: Grade }
}

// --- Delete a grade ---
export async function apiDeleteGrade(id: number) {
  const res = await fetch(`${BASE_URL}/grades/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete grade");
  return res.json(); // { data: { id, deletedAt } }
}
