import React from "react";
import SuperAdminSideBar from "@/components/superadmin/SuperAdminSideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-back">
      {/* Sidebar */}
      <SuperAdminSideBar />

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
