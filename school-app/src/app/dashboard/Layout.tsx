"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";
import RoleNavbar from "@/components/layout/RoleNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { fullUserData: user, fetchPageData } = useSessionStore();
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 1. Load full user data if not already present
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          await fetchPageData("fullUser", true);
        }
      } catch (err) {
        console.error("Failed to load full user data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user, fetchPageData]);

  // -----------------------------
  // 2. Redirect if URL role does not match user's role
  // -----------------------------
  useEffect(() => {
    if (!user || loading) return;

    const segments = pathname.split("/").filter(Boolean);
    const urlRole = segments[1]?.toUpperCase(); // /dashboard/[role]

    if (urlRole && urlRole !== user.role) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, loading, pathname, router]);

  // -----------------------------
  // 3. Show spinner while loading
  // -----------------------------
  if (!user || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-back">
        <div className="w-12 h-12 border-4 border-wine border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // -----------------------------
  // 4. Layout render
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
