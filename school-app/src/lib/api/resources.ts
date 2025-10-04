// lib/api/resources.ts
export interface Resource {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  purchases?: { id: number; quantity: number; totalPrice: number; createdAt: string }[];
  [key: string]: any;
}

const BASE_URL = "/api/resources";

// --- Get all resources ---
export async function apiGetResources({
  name,
  includeRelations = true,
  page = 1,
  pageSize = 20,
  sortField = "createdAt",
  sortDirection = "desc",
}: {
  name?: string;
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

  if (name) params.append("name", name);

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json(); // { data: Resource[], meta: { page, pageSize, total } }
}

// --- Get resource by ID ---
export async function apiGetResourceById(id: number, includeRelations = true) {
  const params = includeRelations ? "?includeRelations=1" : "";
  const res = await fetch(`${BASE_URL}/${id}${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resource");
  return res.json(); // { data: Resource }
}

// --- Create a new resource ---
export async function apiCreateResource(resource: Partial<Resource>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(resource),
  });
  if (!res.ok) throw new Error("Failed to create resource");
  return res.json(); // { data: Resource }
}

// --- Update an existing resource ---
export async function apiUpdateResource(id: number, resource: Partial<Resource>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(resource),
  });
  if (!res.ok) throw new Error("Failed to update resource");
  return res.json(); // { data: Resource }
}

// --- Delete a resource ---
export async function apiDeleteResource(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete resource");
  return res.json(); // { data: { id, deletedAt } }
}
