"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";
import RoleNavbar from "@/components/layout/RoleNavbar";

interface LayoutProps {
  children: ReactNode;
  allowedRoles?: string[]; // optional: if undefined → any logged-in user
}

export default function AppLayout({ children, allowedRoles }: LayoutProps) {
  const router = useRouter();
  const { fullUserData, fetchPageData } = useSessionStore();

  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 1. Ensure full user data is loaded
  // -----------------------------
  useEffect(() => {
    const initSession = async () => {
      try {
        if (!fullUserData) {
          // Fetch "full" user data only once
          await fetchPageData("fullUser", true);
        }
      } catch (err) {
        console.error("Failed to fetch full session data:", err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [fullUserData, fetchPageData]);

  // -----------------------------
  // 2. Determine login & role
  // -----------------------------
  const loggedIn = !!fullUserData;
  const userRole = fullUserData?.role;

  // -----------------------------
  // 3. Dynamic redirect for unauthorized users
  // -----------------------------
  useEffect(() => {
    if (loading) return;

    if (!loggedIn) {
      router.replace("/login");
      return;
    }

    // If allowedRoles is defined, only allow users whose role matches
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      router.replace("/login");
    }
  }, [loading, loggedIn, userRole, allowedRoles, router]);

  // -----------------------------
  // 4. Loading spinner while session initializes
  // -----------------------------
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-back">
        <div className="w-12 h-12 border-4 border-wine border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // -----------------------------
  // 5. Layout render
  // -----------------------------
  return (
    <div className="flex flex-col h-screen bg-back">
      {/* Navbar + Sidebar */}
      <RoleNavbar />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-4 md:ml-64">{children}</main>
    </div>
  );
}
