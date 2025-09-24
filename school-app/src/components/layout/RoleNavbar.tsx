"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import RoleSidebar from "./RoleSidebar";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function RoleNavbar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, loading, loggedIn } = useSessionStore();

  const firstName = user?.name?.split(" ")[0] ?? "User";

  // While session is being fetched → show spinner
  if (loading) {
    return (
      <nav className="bg-wine text-back border-b border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-light"></div>
        </div>
      </nav>
    );
  }

  // If not logged in or no user data
  if (!loggedIn || !user) {
    return null;
  }

  return (
    <>
      <nav className="bg-wine text-back border-b border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link
            href={`/${user.role.toLowerCase()}/dashboard`}
            className="text-xl font-bold text-back ml-2 md:ml-0"
          >
            FordSchools
          </Link>

          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded hover:bg-light"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
            >
              {mobileSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>

            {/* Desktop user info */}
            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 hover:text-light">🔔</button>
              <button className="relative p-2 hover:text-light">💬</button>
              <div className="p-2 rounded bg-light text-wine font-semibold">
                {firstName} ({user.role})
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <RoleSidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
    </>
  );
}
