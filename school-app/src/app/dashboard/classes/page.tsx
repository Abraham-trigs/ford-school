"use client";

import { useRoleGuard } from "@/lib/auth/roleGuard";

export default function ClassesPage() {
  const user = useRoleGuard(["ADMIN", "PRINCIPAL", "TEACHER"]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-primary mb-4">
        Classes Management
      </h1>
      <p className="text-lightGray mb-6">
        Accessible roles: ADMIN, PRINCIPAL, TEACHER. Current role: {user.role}.
      </p>

      {/* Placeholder Table for Classes */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-muted rounded-lg">
          <thead className="bg-deeper text-lightGray">
            <tr>
              <th className="px-4 py-2 text-left">Class Name</th>
              <th className="px-4 py-2 text-left">Teacher</th>
              <th className="px-4 py-2 text-left">Students</th>
            </tr>
          </thead>
          <tbody className="text-lightGray">
            <tr className="border-t border-muted">
              <td className="px-4 py-2">Class 1A</td>
              <td className="px-4 py-2">John Doe</td>
              <td className="px-4 py-2">30</td>
            </tr>
            <tr className="border-t border-muted">
              <td className="px-4 py-2">Class 2B</td>
              <td className="px-4 py-2">Jane Smith</td>
              <td className="px-4 py-2">28</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
