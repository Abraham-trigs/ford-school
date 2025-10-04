// lib/api/transactions.ts
export interface Transaction {
  id: number;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description?: string;
  date: string;
  studentId?: number;
  staffId?: number;
  resourceId?: number;

  // Relations
  student?: { id: number; fullName: string };
  staff?: { id: number; fullName: string };
  resource?: { id: number; name: string };
  [key: string]: any;
}

const BASE_URL = "/api/transactions";

// --- Get all transactions ---
export async function apiGetTransactions({
  page = 1,
  pageSize = 20,
  sortBy = "date",
  sortOrder = "desc",
  studentId,
  staffId,
  resourceId,
  search,
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  studentId?: number;
  staffId?: number;
  resourceId?: number;
  search?: string;
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    sortOrder,
  });

  if (studentId) params.append("studentId", studentId.toString());
  if (staffId) params.append("staffId", staffId.toString());
  if (resourceId) params.append("resourceId", resourceId.toString());
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json(); // { data: Transaction[], meta: { page, pageSize, total } }
}

// --- Get transaction by ID ---
export async function apiGetTransactionById(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch transaction");
  return res.json(); // { data: Transaction }
}

// --- Create transaction ---
export async function apiCreateTransaction(transaction: Partial<Transaction>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(transaction),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json(); // { data: Transaction }
}

// --- Update transaction ---
export async function apiUpdateTransaction(id: number, transaction: Partial<Transaction>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(transaction),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return res.json(); // { data: Transaction }
}

// --- Delete transaction ---
export async function apiDeleteTransaction(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  return res.json(); // { data: { id, deletedAt } }
}
