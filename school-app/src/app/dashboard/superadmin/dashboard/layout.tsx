"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useUIStore } from "./store/uiStore";
import { useSuperAdminStore } from "./store/superAdminStore";
import { useRouter } from "next/navigation";
import LoaderModal from "../dashboard/components/LoaderModal";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { screenWidth } = useUIStore();
  const { isAuthenticated, setSuperAdmin, logout } = useSuperAdminStore();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Handle mobile responsiveness
  useEffect(() => {
    setIsMobile(screenWidth <= 425);
    const handleResize = () => setIsMobile(window.innerWidth <= 425);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [screenWidth]);

  // ✅ Check session & hydrate store
  useEffect(() => {
    const initAuth = async () => {
      try {
        const refreshToken = localStorage.getItem("superAdminRefreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await fetch("/api/auth/superadmin/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();
        setSuperAdmin(data.superAdmin, data.accessToken);
      } catch (err) {
        console.warn("Session refresh failed:", err);
        logout();
        router.replace("/dashboard/superadmin/login");
      } finally {
        setHydrated(true);
        setLoading(false);
      }
    };

    initAuth();
  }, [router, setSuperAdmin, logout]);

  // ✅ Show LoaderModal while loading
  return (
    <>
      <LoaderModal
        isVisible={!hydrated || loading}
        text="Checking session..."
      />
      {hydrated && !loading && (
        <div className="flex min-h-screen">
          {!isMobile && <Sidebar />}
          <div className="flex-1 flex flex-col relative">
            <Navbar />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}
