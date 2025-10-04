// lib/api/courses.ts
export interface Course {
  id: number;
  name: string;
  description?: string;
  classroomId?: number;
  schoolSessionId?: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  classroom?: { id: number; name: string };
  students?: { id: number; fullName: string; email?: string }[];
  assignments?: { id: number; title: string; dueDate: string }[];
  [key: string]: any;
}

const BASE_URL = "/api/courses";

// --- Get all courses (with relations, pagination, filtering, sorting) ---
export async function apiGetCourses({
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
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json(); // { data: Course[], meta: { page, pageSize, total } }
}

// --- Get course by ID (with relations) ---
export async function apiGetCourseById(id: number, includeRelations = true) {
  const params = includeRelations ? "?includeRelations=1" : "";
  const res = await fetch(`${BASE_URL}/${id}${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch course");
  return res.json(); // { data: Course }
}

// --- Create a course ---
export async function apiCreateCourse(course: Partial<Course>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error("Failed to create course");
  return res.json(); // { data: Course }
}

// --- Update a course ---
export async function apiUpdateCourse(id: number, course: Partial<Course>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error("Failed to update course");
  return res.json(); // { data: Course }
}

// --- Delete a course ---
export async function apiDeleteCourse(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete course");
  return res.json(); // { data: { id, deletedAt } }
}
