"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useUIStore } from "./store/uiStore";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { screenWidth } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(screenWidth <= 425);

    function handleResize() {
      setIsMobile(window.innerWidth <= 425);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [screenWidth]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      <div className="flex-1 flex flex-col relative">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
