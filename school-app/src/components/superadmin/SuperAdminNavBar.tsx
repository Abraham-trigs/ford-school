"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import SuperAdminSideBar from "./SuperAdminSideBar";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function SuperAdminNavBar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleSidebar = () => setMobileSidebarOpen((prev) => !prev);

  const { user } = useSessionStore(); // get current logged-in user
  const role = user?.role ?? "superadmin"; // fallback if undefined
  const roleLower = role.toLowerCase();

  return (
    <>
      <nav className="bg-wine text-back border-b border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link
            href={`/${roleLower}/dashboard`}
            className="text-xl font-bold text-back ml-2 md:ml-0"
          >
            FordSchools
          </Link>

          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded hover:bg-light"
              onClick={toggleSidebar}
            >
              {mobileSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>

            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 hover:text-light">🔔</button>
              <button className="relative p-2 hover:text-light">💬</button>
              <div className="p-2 rounded bg-light text-wine font-semibold">
                {role}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SuperAdminSideBar
        role={role}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 mt-16 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}
