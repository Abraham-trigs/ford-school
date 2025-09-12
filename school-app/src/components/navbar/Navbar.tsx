"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import ProfileMenu from "./ProfileMenu";
import Sidebar from "@/components/teacher/Sidebar";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function Navbar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const role = useSessionStore((state) => state.role); // get role from Zustand
  const rolePath = role ? role.toLowerCase() : "/login";

  const toggleSidebar = () => setMobileSidebarOpen((prev) => !prev);

  return (
    <>
      <nav className="bg-[#470107] text-back border-b border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={rolePath}
            className="text-xl font-bold text-back ml-2 md:ml-0"
          >
            FordSchools
          </Link>

          {/* Right-side items */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded hover:bg-light"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 hover:text-light">🔔</button>
              <button className="relative p-2 hover:text-light">💬</button>
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Sidebar
        mode="mobile"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
    </>
  );
}
