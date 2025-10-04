// lib/api/transport.ts
export interface Transport {
  id: number;
  vehicleNumber: string;
  driverName: string;
  capacity: number;
  route?: string;
  createdAt: string;

  // Relations
  students?: { id: number; fullName: string }[];
  [key: string]: any;
}

const BASE_URL = "/api/transport";

// --- Get all transport entries ---
export async function apiGetTransport({
  page = 1,
  pageSize = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
  vehicleNumber,
  driverName,
  route,
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  vehicleNumber?: string;
  driverName?: string;
  route?: string;
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    sortOrder,
  });

  if (vehicleNumber) params.append("vehicleNumber", vehicleNumber);
  if (driverName) params.append("driverName", driverName);
  if (route) params.append("route", route);

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch transport data");
  return res.json(); // { data: Transport[], meta: { page, pageSize, total } }
}

// --- Get transport by ID ---
export async function apiGetTransportById(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch transport entry");
  return res.json(); // { data: Transport }
}

// --- Create transport entry ---
export async function apiCreateTransport(entry: Partial<Transport>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to create transport entry");
  return res.json(); // { data: Transport }
}

// --- Update transport entry ---
export async function apiUpdateTransport(id: number, entry: Partial<Transport>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to update transport entry");
  return res.json(); // { data: Transport }
}

// --- Delete transport entry ---
export async function apiDeleteTransport(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete transport entry");
  return res.json(); // { data: { id, deletedAt } }
}
