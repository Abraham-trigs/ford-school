// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/dashboard/components/Sidebar";
import Navbar from "@/app/dashboard/components/Navbar";
import Card from "@/app/dashboard/components/Card";

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-secondary">
        <Navbar />
        <main className="p-6 flex-1">
          <div className="mb-6">
            <h2 className="text-deepPurple font-display text-2xl">
              Welcome, {user?.name || user?.email}
            </h2>
            <p className="text-lightGray">Role: {user?.role}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Total Users" value={1200} />
            <Card title="Total Schools" value={45} color="accentTeal" />
            <Card title="Pending Approvals" value={8} color="accentPurple" />
          </div>
        </main>
      </div>
    </div>
  );
}
