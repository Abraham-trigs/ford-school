"use client";

import { ReactNode, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoaderModal from "@/components/layout/LoaderModal";
import { useSessionStore } from "@/store/sessionStore";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const initCalled = useRef(false);

  const { user, loading, refreshProfile } = useSessionStore();

  useEffect(() => {
    // 🚫 Only run once on mount
    if (initCalled.current) return;
    initCalled.current = true;

    const init = async () => {
      const profile = await refreshProfile();

      // 🧠 Only redirect once (avoid race with layout hydration)
      if (!profile) {
        console.warn("No active session → redirecting to /login");
        router.replace("/login");
      }
    };

    init();
  }, [refreshProfile, router]);

  if (loading || !user) {
    return <LoaderModal isVisible text="Loading dashboard..." />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex flex-col w-64">
        <Sidebar user={user} />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="w-full shadow-md z-10">
          <Navbar user={user} />
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
