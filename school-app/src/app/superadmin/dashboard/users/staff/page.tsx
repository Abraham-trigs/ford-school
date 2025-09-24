"use client";

import { useEffect, useState } from "react";
import { useUsersStore } from "@/lib/store/UserStore";
import DetailButton from "@/components/DetailButton";
const allRoles = [
  "SUPERADMIN",
  "ADMIN",
  "TEACHER",
  "SECRETARY",
  "ACCOUNTANT",
  "LIBRARIAN",
  "COUNSELOR",
  "NURSE",
  "CLEANER",
  "JANITOR",
  "COOK",
  "KITCHEN_ASSISTANT",
  "STUDENT",
  "PARENT",
] as const;

const staffRoles = allRoles.filter((r) => !["STUDENT", "PARENT"].includes(r));

export default function StaffPage() {
  const fetchUsersIfAllowed = useUsersStore((s) => s.fetchUsersIfAllowed);
  const staff = useUsersStore((s) => s.staff);
  const userLoading = useUsersStore((s) => s.userLoading);
  const addUser = useUsersStore((s) => s.addUser);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "TEACHER",
  });

  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchUsersIfAllowed();
  }, [fetchUsersIfAllowed]);

  const filteredStaff =
    selectedFilter === "ALL"
      ? staff
      : staff.filter((s) => s.role === selectedFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return alert("Name, email and password are required");
    }

    const roleValue = staffRoles.includes(form.role as any)
      ? (form.role as any)
      : "TEACHER";

    try {
      await addUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: roleValue,
      });

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "TEACHER",
      });
    } catch (err) {
      console.error("Failed to add staff:", err);
      alert("Failed to add staff. See console for details.");
    }
  };

  if (userLoading) return <p className="text-gray-400">Loading staff...</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold">Manage All Staff</h1>

      {/* ---------------- NEW STAFF FORM ---------------- */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border border-gray-700 bg-gray-800 rounded-lg space-y-4"
      >
        <h2 className="font-semibold">Add New Staff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-100"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-100"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-100"
          />

          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-100"
          />
          <select
            value={form.role}
            onChange={(e) => {
              const value = e.target.value as any;
              if (staffRoles.includes(value)) setForm({ ...form, role: value });
            }}
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-100"
          >
            {staffRoles.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          Add Staff
        </button>
      </form>

      {/* ---------------- Filter Buttons (NOW BELOW FORM) ---------------- */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded ${
            selectedFilter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setSelectedFilter("ALL")}
        >
          All
        </button>

        {staffRoles.map((role) => (
          <button
            key={role}
            className={`px-3 py-1 rounded ${
              selectedFilter === role
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setSelectedFilter(role)}
          >
            {role.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* ---------------- STAFF LIST ---------------- */}
      {filteredStaff.length === 0 ? (
        <p className="text-gray-500">No staff found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStaff.map((s) => (
            <li
              key={s.id}
              className="p-4 rounded-lg border border-gray-700 bg-gray-800 flex flex-col justify-between"
            >
              <div className="mb-4">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-400">{s.email}</p>
                {s.phone && <p className="text-sm text-gray-500">{s.phone}</p>}
                <p className="text-xs text-gray-500">
                  Role: {s.role} • Joined:{" "}
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              <DetailButton
                id={s.id}
                name={s.name}
                basePath="/superadmin/dashboard/users/staff"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
