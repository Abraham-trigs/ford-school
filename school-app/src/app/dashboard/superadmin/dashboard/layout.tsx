"use client";

import { ReactNode, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoaderModal from "@/components/layout/LoaderModal";
import { useSessionStore } from "@/store/sessionStore";
import { useRouter } from "next/navigation";
import { useAutoRefresh } from "@/lib/hooks/AutoRefresh";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const initCalled = useRef(false);
  const { user, loading, refreshProfile } = useSessionStore();

  useAutoRefresh();

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const init = async () => {
      const profile = await refreshProfile();
      if (!profile) {
        console.warn("No active session → redirecting to /login");
        router.replace("/login");
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ stable

  if (loading || !user) {
    return <LoaderModal isVisible text="Loading dashboard..." />;
  }

  return (
    <div className="flex min-h-screen bg-layout">
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
