"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";
import SuperAdminNavBar from "@/components/superadmin/SuperAdminNavBar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loggedIn, loading, user } = useSessionStore();
  const router = useRouter();

  // Redirect unauthenticated users or non-superadmins to login
  useEffect(() => {
    if (!loading && (!loggedIn || user?.role !== "SUPERADMIN")) {
      router.replace("/login");
    }
  }, [loggedIn, loading, user, router]);

  // Show loading while session is initializing
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-wine">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-background">
      {/* Navbar + Sidebar */}
      <SuperAdminNavBar />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-4 md:ml-64">{children}</main>
    </div>
  );
}
