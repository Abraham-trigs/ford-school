"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";
import RoleNavbar from "@/components/layout/RoleNavbar";

interface LayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function AppLayout({ children, allowedRoles }: LayoutProps) {
  const router = useRouter();
  const { fullUserData, fetchPageData } = useSessionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        if (!fullUserData) {
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

  const loggedIn = !!fullUserData;
  const userRole = fullUserData?.role;

  useEffect(() => {
    if (loading) return;

    if (!loggedIn) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      router.replace("/login");
    }
  }, [loading, loggedIn, userRole, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-back">
        <div className="w-12 h-12 border-4 border-wine border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-back">
      <RoleNavbar />
      <main className="flex-1 overflow-y-auto p-4 md:ml-64">{children}</main>
    </div>
  );
}
