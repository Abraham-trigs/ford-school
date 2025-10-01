"use client";

import { ReactNode, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { useUIStore } from "./store/uiStore";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sidebarOpen, initializeSidebar } = useUIStore();

  // Initialize sidebar open/close based on screen size
  useEffect(() => {
    initializeSidebar();
  }, [initializeSidebar]);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
