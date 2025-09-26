"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";
import RoleNavbar from "@/components/layout/RoleNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { fullUserData: user } = useSessionStore();
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 1. Redirect logic based on session & role
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    // If URL role does not match user's role, redirect to correct dashboard
    const pathSegments = router.pathname.split("/").filter(Boolean);
    const urlRole = pathSegments[1]?.toUpperCase(); // /dashboard/[role]

    if (urlRole && urlRole !== user.role) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }

    setLoading(false);
  }, [user, router]);

  // -----------------------------
  // 2. Show spinner while loading
  // -----------------------------
  if (!user || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-back">
        <div className="w-12 h-12 border-4 border-wine border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // -----------------------------
  // 3. Layout render
  // -----------------------------
  return (
    <div className="flex flex-col h-screen bg-back">
      {/* Navbar + Sidebar */}
      <RoleNavbar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:ml-64">{children}</main>
    </div>
  );
}
