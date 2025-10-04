// lib/api/schools.ts
export interface School {
  id: number;
  name: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;

  // Relations (optional)
  members?: { userId: number; role: string; active: boolean }[];
  [key: string]: any;
}

const BASE_URL = "/api/schools";

// --- Get all schools ---
export async function apiGetSchools({
  page = 1,
  pageSize = 20,
  includeRelations = true,
  name,
}: {
  page?: number;
  pageSize?: number;
  includeRelations?: boolean;
  name?: string;
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    includeRelations: includeRelations ? "1" : "0",
  });

  if (name) params.append("name", name);

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch schools");
  return res.json(); // { data: School[], meta: { page, pageSize, total } }
}

// --- Get school by ID ---
export async function apiGetSchoolById(id: number, includeRelations = true) {
  const params = includeRelations ? "?includeRelations=1" : "";
  const res = await fetch(`${BASE_URL}/${id}${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch school");
  return res.json(); // { data: School }
}

// --- Create a new school ---
export async function apiCreateSchool(school: Partial<School>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(school),
  });
  if (!res.ok) throw new Error("Failed to create school");
  return res.json(); // { data: School }
}

// --- Update an existing school ---
export async function apiUpdateSchool(id: number, school: Partial<School>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(school),
  });
  if (!res.ok) throw new Error("Failed to update school");
  return res.json(); // { data: School }
}

// --- Delete a school ---
export async function apiDeleteSchool(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete school");
  return res.json(); // { data: { id, deletedAt } }
}
