"use client";

import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/teacher/Sidebar";
import TeacherStats from "@/components/teacher/TeacherStats";
import RecentActivity from "@/components/teacher/RecentActivity";

export default function TeacherDashboard() {
  return (
    <div className="bg-back text-back min-h-screen flex flex-col">
      {/* Navbar always on top */}
      <Navbar role="TEACHER" />

      {/* Layout: sidebar + main */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar mode="desktop" />

        {/* Main dashboard content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6 text-wine">
            Welcome, Teacher
          </h1>

          {/* Dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teacher Stats spans 2 columns */}
            <div className="lg:col-span-2">
              <TeacherStats />
            </div>

            {/* Recent Activity */}
            <div>
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
