"use client";

import { useRoleGuard } from "@/lib/auth/roleGuard";

export default function TeachersPage() {
  const user = useRoleGuard(["ADMIN", "PRINCIPAL"]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-primary mb-4">
        Teachers Management
      </h1>
      <p className="text-lightGray mb-6">
        Accessible roles: ADMIN, PRINCIPAL. Current role: {user.role}.
      </p>

      {/* Placeholder Table for Teachers */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-muted rounded-lg">
          <thead className="bg-deeper text-lightGray">
            <tr>
              <th className="px-4 py-2 text-left">Teacher Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Subjects</th>
              <th className="px-4 py-2 text-left">Classes</th>
            </tr>
          </thead>
          <tbody className="text-lightGray">
            <tr className="border-t border-muted">
              <td className="px-4 py-2">John Doe</td>
              <td className="px-4 py-2">johndoe@example.com</td>
              <td className="px-4 py-2">Math, Physics</td>
              <td className="px-4 py-2">Class 1A, 2B</td>
            </tr>
            <tr className="border-t border-muted">
              <td className="px-4 py-2">Jane Smith</td>
              <td className="px-4 py-2">janesmith@example.com</td>
              <td className="px-4 py-2">English, History</td>
              <td className="px-4 py-2">Class 1B, 3A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
