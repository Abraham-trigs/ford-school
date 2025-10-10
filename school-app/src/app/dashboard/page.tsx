"use client";

import { useRoleGuard } from "@/lib/auth/roleGuard";

interface PageProps {
  title: string;
  allowedRoles: string[];
}

export default function DashboardSection({
  title,
  allowedRoles = [],
}: PageProps) {
  const user = useRoleGuard(allowedRoles);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-primary mb-4">{title}</h1>
      <p className="text-lightGray">
        Accessible roles: {allowedRoles.join(", ")}. Current role:{" "}
        {user?.role ?? "N/A"}
      </p>
    </div>
  );
}
