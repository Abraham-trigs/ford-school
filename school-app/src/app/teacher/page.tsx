"use client";

import Navbar from "@/components/navbar/Navbar";
import TeacherStats from "@/components/teacher/TeacherStats";
import RecentActivity from "@/components/teacher/RecentActivity";

export default function TeacherDashboard() {
  return (
    <div className="bg-back text-back min-h-screen flex flex-col">
      {/* Universal Navbar */}
      <Navbar role="TEACHER" />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar is handled inside Navbar for mobile; desktop shows static sidebar */}
        <div className="hidden md:flex">
          {/* Desktop Sidebar */}
          {/* The Sidebar component is used internally for both desktop and mobile via Navbar */}
        </div>

        {/* Main dashboard content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Welcome, Teacher</h1>
          <TeacherStats />
          <RecentActivity />
        </main>
      </div>
    </div>
  );
}
