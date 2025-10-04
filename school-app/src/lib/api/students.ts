// lib/api/students.ts
export interface Student {
  id: number;
  fullName: string;
  email?: string;
  profilePicture?: string;
  classroomId?: number;
  schoolSessionId?: number;
  createdAt: string;
  updatedAt: string;

  // Relationships
  classroom?: { id: number; name: string };
  courses?: { id: number; name: string }[];
  grades?: { id: number; assignmentId: number; score: number }[];
  assignments?: { id: number; title: string; dueDate: string }[];
  parents?: { id: number; fullName: string; email?: string }[];
  [key: string]: any;
}

const BASE_URL = "/api/students";

// --- Get all students (with relations, pagination, filtering) ---
export async function apiGetStudents({
  classroomId,
  schoolSessionId,
  includeRelations = false,
  page = 1,
  pageSize = 20,
  sortField = "createdAt",
  sortDirection = "desc",
}: {
  classroomId?: number;
  schoolSessionId?: number;
  includeRelations?: boolean;
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
    includeRelations: includeRelations ? "1" : "0",
  });

  if (classroomId) params.append("classroomId", classroomId.toString());
  if (schoolSessionId) params.append("schoolSessionId", schoolSessionId.toString());

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json(); // { data: Student[], meta: { page, pageSize, total } }
}

// --- Get a student by ID (with relations) ---
export async function apiGetStudentById(id: number, includeRelations = true) {
  const params = includeRelations ? "?includeRelations=1" : "";
  const res = await fetch(`${BASE_URL}/${id}${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch student");
  return res.json(); // { data: Student }
}

// --- Create a student ---
export async function apiCreateStudent(student: Partial<Student>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to create student");
  return res.json(); // { data: Student }
}

// --- Update a student ---
export async function apiUpdateStudent(id: number, student: Partial<Student>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json(); // { data: Student }
}

// --- Delete a student ---
export async function apiDeleteStudent(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete student");
  return res.json(); // { data: { id, deletedAt } }
}
