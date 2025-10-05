"use client";

import { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoaderModal from "@/components/layout/LoaderModal";
import { useAuthStore } from "@/store/authStore";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading: authLoading } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
  }));

  // 🔹 Show loader if auth state is loading or user is not yet loaded
  if (authLoading || !user) {
    return <LoaderModal isVisible text="Loading dashboard..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <Sidebar user={user} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="w-full shadow-md bg-white z-10">
          <Navbar user={user} />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
