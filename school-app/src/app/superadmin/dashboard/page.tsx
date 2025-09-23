"use client";

import { useState, useEffect } from "react";

type Stats = {
  totalUsers: number;
  totalStudents: number;
  totalStaff: number;
  paymentsPending: number;
  activeEvents: number;
};

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalStudents: 0,
    totalStaff: 0,
    paymentsPending: 0,
    activeEvents: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      setStats({
        totalUsers: 150,
        totalStudents: 120,
        totalStaff: 30,
        paymentsPending: 5,
        activeEvents: 3,
      });
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Students", value: stats.totalStudents },
    { label: "Staff", value: stats.totalStaff },
    { label: "Payments Pending", value: stats.paymentsPending },
    { label: "Active Events", value: stats.activeEvents },
  ];

  return (
    <>
      <h1 className="text-3xl font-display font-bold mb-6">Dashboard</h1>

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

      {/* Placeholder for future sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-wine text-back rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-back mb-2">Quick Links</h2>
          <ul className="list-disc list-inside">
            <li>Manage Users</li>
            <li>View Payments</li>
            <li>Check Attendance</li>
            <li>View Reports</li>
          </ul>
        </div>

        <div className="bg-wine text-back rounded-lg p-6 shadow">
          <h2 className="text-xl text-back font-semibold mb-2">
            Recent Activity
          </h2>
          <p>Placeholder for activity logs or notifications...</p>
        </div>
      </div>
    </>
  );
}
