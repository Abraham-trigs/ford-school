// lib/api/graduations.ts
export interface Graduation {
  id: number;
  studentId: number;
  courseId?: number;
  schoolSessionId?: number;
  graduationDate: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: { id: number; fullName: string; email?: string };
  course?: { id: number; name: string };
  schoolSession?: { id: number; name: string };
  [key: string]: any;
}

const BASE_URL = "/api/graduations";

// --- Get all graduations (with relations, pagination, filtering, sorting) ---
export async function apiGetGraduations({
  studentId,
  courseId,
  schoolSessionId,
  includeRelations = true,
  page = 1,
  pageSize = 20,
  sortField = "graduationDate",
  sortDirection = "desc",
}: {
  studentId?: number;
  courseId?: number;
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

  if (studentId) params.append("studentId", studentId.toString());
  if (courseId) params.append("courseId", courseId.toString());
  if (schoolSessionId) params.append("schoolSessionId", schoolSessionId.toString());

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch graduations");
  return res.json(); // { data: Graduation[], meta: { page, pageSize, total } }
}

// --- Get graduation by ID ---
export async function apiGetGraduationById(id: number, includeRelations = true) {
  const params = includeRelations ? "?includeRelations=1" : "";
  const res = await fetch(`${BASE_URL}/${id}${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch graduation");
  return res.json(); // { data: Graduation }
}

// --- Create a graduation record ---
export async function apiCreateGraduation(graduation: Partial<Graduation>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(graduation),
  });
  if (!res.ok) throw new Error("Failed to create graduation");
  return res.json(); // { data: Graduation }
}

// --- Update a graduation record ---
export async function apiUpdateGraduation(id: number, graduation: Partial<Graduation>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(graduation),
  });
  if (!res.ok) throw new Error("Failed to update graduation");
  return res.json(); // { data: Graduation }
}

// --- Delete a graduation record ---
export async function apiDeleteGraduation(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete graduation");
  return res.json(); // { data: { id, deletedAt } }
}
