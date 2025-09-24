"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import RoleSidebar from "./RoleSidebar";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function RoleNavbar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ✅ grab derived fields directly from the store
  const { role, firstName, loggedIn } = useSessionStore();

  return (
    <nav className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          className="md:hidden text-textPrimary"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
        <Link href="/" className="text-lg font-semibold text-textPrimary">
          School App
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {loggedIn && (
          <span className="text-textSecondary">Hi, {firstName}</span>
        )}
      </div>

      {/* ✅ mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="absolute top-12 left-0 w-3/4 max-w-xs h-screen bg-surface shadow-lg md:hidden">
          <RoleSidebar
            onLinkClick={() => setMobileSidebarOpen(false)}
            role={role ?? ""}
          />
        </div>
      )}
    </nav>
  );
}
