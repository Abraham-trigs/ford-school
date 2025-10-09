"use client";

import { useRoleGuard } from "@/lib/auth/roleGuard";

export default function ParentsPage() {
  const user = useRoleGuard(["ADMIN", "PARENT"]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-primary mb-4">
        Parents & Children
      </h1>
      <p className="text-lightGray mb-6">
        Accessible roles: ADMIN, PARENT. Current role: {user.role}.
      </p>

      {/* Placeholder Table for Parents & Children */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-muted rounded-lg">
          <thead className="bg-deeper text-lightGray">
            <tr>
              <th className="px-4 py-2 text-left">Parent Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Child Name</th>
              <th className="px-4 py-2 text-left">Class</th>
            </tr>
          </thead>
          <tbody className="text-lightGray">
            {user.role === "PARENT" ? (
              <tr className="border-t border-muted">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">Alice Johnson</td>
                <td className="px-4 py-2">Class 1A</td>
              </tr>
            ) : (
              <>
                <tr className="border-t border-muted">
                  <td className="px-4 py-2">Mr. Johnson</td>
                  <td className="px-4 py-2">johnson@example.com</td>
                  <td className="px-4 py-2">Alice Johnson</td>
                  <td className="px-4 py-2">Class 1A</td>
                </tr>
                <tr className="border-t border-muted">
                  <td className="px-4 py-2">Mrs. Smith</td>
                  <td className="px-4 py-2">smith@example.com</td>
                  <td className="px-4 py-2">Michael Smith</td>
                  <td className="px-4 py-2">Class 2B</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
