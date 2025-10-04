// lib/api/classrooms.ts
export interface Classroom {
  id: number;
  name: string;
  gradeLevel: string;
  schoolSessionId: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

const BASE_URL = "/api/classrooms";

// --- Get all classrooms (with pagination, filtering, sorting) ---
export async function apiGetClassrooms({
  page = 1,
  pageSize = 20,
  search,
  sortField = "createdAt",
  sortDirection = "desc",
  schoolSessionId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  schoolSessionId?: number;
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortField,
    sortDirection,
  });

  if (search) params.append("search", search);
  if (schoolSessionId) params.append("schoolSessionId", schoolSessionId.toString());

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch classrooms");
  return res.json(); // { data: Classroom[], meta: {...} }
}

// --- Get a single classroom ---
export async function apiGetClassroomById(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch classroom");
  return res.json(); // { data: Classroom }
}

// --- Create classroom ---
export async function apiCreateClassroom(classroom: Partial<Classroom>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(classroom),
  });
  if (!res.ok) throw new Error("Failed to create classroom");
  return res.json(); // { data: Classroom }
}

// --- Update classroom ---
export async function apiUpdateClassroom(id: number, classroom: Partial<Classroom>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(classroom),
  });
  if (!res.ok) throw new Error("Failed to update classroom");
  return res.json(); // { data: Classroom }
}

// --- Delete classroom (soft delete) ---
export async function apiDeleteClassroom(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete classroom");
  return res.json(); // { data: { id, deletedAt } }
}

// --- Get students of a classroom ---
export async function apiGetClassroomStudents(classroomId: number) {
  const res = await fetch(`${BASE_URL}/${classroomId}/students`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch classroom students");
  return res.json(); // { data: Student[] }
}

// --- Add a student to a classroom ---
export async function apiAddStudentToClassroom(classroomId: number, studentId: number) {
  const res = await fetch(`${BASE_URL}/${classroomId}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ studentId }),
  });
  if (!res.ok) throw new Error("Failed to add student to classroom");
  return res.json(); // { data: relation }
}

// --- Remove a student from a classroom ---
export async function apiRemoveStudentFromClassroom(classroomId: number, studentId: number) {
  const res = await fetch(`${BASE_URL}/${classroomId}/students/${studentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove student from classroom");
  return res.json(); // { data: { classroomId, studentId, deletedAt } }
}
