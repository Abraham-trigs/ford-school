"use client";

import { useRoleGuard } from "@/lib/auth/roleGuard";

export default function UsersPage() {
  const user = useRoleGuard(["ADMIN", "PRINCIPAL"]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-primary mb-4">
        User Management
      </h1>
      <p className="text-lightGray">
        Only ADMIN and PRINCIPAL can see this page. Current role: {user.role}
      </p>
      {/* You can later add table of users, CRUD actions, etc. */}
    </div>
  );
}
