"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function RoleDashboardPage({
  params,
}: {
  params: { role: string };
}) {
  const router = useRouter();
  const { fullUserData: user, roleCounts } = useSessionStore();

  const roleParam = params.role.toUpperCase();

  // Redirect if user role does not match URL
  useEffect(() => {
    if (!user) return;
    if (user.role !== roleParam) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, roleParam, router]);

  if (!user)
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );

  // Map roleCounts keys to stat cards
  const statCards = [
    { label: "Total Users", value: roleCounts["createdJobs"] || 0 }, // adjust as needed
    { label: "Students", value: roleCounts["student"] || 0 },
    { label: "Staff", value: roleCounts["staff"] || 0 },
    { label: "Payments Pending", value: roleCounts["payments"] || 0 },
    { label: "Active Events", value: roleCounts["createdEvents"] || 0 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-display font-bold mb-6">
        {user.role} Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-wine text-back rounded-lg shadow p-4 flex flex-col justify-between hover:scale-105 transition-transform"
          >
            <span className="text-lg font-semibold">{card.label}</span>
            <span className="text-2xl font-bold mt-2">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-wine text-back rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
          <ul className="list-disc list-inside">
            <li>Manage Users</li>
            <li>View Payments</li>
            <li>Check Attendance</li>
            <li>View Reports</li>
          </ul>
        </div>

        <div className="bg-wine text-back rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <p>Placeholder for activity logs or notifications...</p>
        </div>
      </div>
    </div>
  );
}
