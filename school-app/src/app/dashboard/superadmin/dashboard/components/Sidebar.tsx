"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  School,
  Settings,
  FileText,
  BookOpen,
  CalendarCheck,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useUIStore } from "../store/uiStore";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard/superadmin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users Management",
    href: "/dashboard/superadmin/dashboard/users",
    icon: Users,
  },
  {
    label: "Schools Management",
    href: "/dashboard/superadmin/dashboard/schools",
    icon: School,
  },
  {
    label: "Admissions",
    href: "/dashboard/superadmin/dashboard/admissions",
    icon: FileText,
  },
  {
    label: "Attendance",
    href: "/dashboard/superadmin/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Exams & Results",
    href: "/dashboard/superadmin/dashboard/exams",
    icon: BookOpen,
  },
  {
    label: "Finance",
    href: "/dashboard/superadmin/dashboard/finance",
    icon: DollarSign,
  },
  {
    label: "Reports",
    href: "/dashboard/superadmin/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/superadmin/dashboard/settings",
    icon: Settings,
  },
  { label: "Logout", href: "/logout", icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    activePath,
    setActivePath,
  } = useUIStore();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // 🔥 Sync store with current pathname
  useEffect(() => {
    if (pathname) setActivePath(pathname);
  }, [pathname, setActivePath]);

  // 🔥 Click outside to close (only on mobile)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        window.innerWidth < 1024 // only for < lg
      ) {
        closeSidebar();
      }
    }
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, closeSidebar]);

  // Sidebar hidden on mobile unless open
  if (!sidebarOpen && window.innerWidth < 1024) return null;

  return (
    <motion.aside
      ref={sidebarRef}
      animate={{ width: sidebarCollapsed ? "80px" : "260px" }}
      className={`bg-deepPurple text-secondary h-screen p-4 flex flex-col shadow-lg relative z-50
        ${window.innerWidth < 1024 ? "fixed top-0 left-0 h-full" : ""}`}
    >
      {/* Collapse Button (desktop only) */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-accentTeal text-deepPurple p-1 rounded-full shadow hover:bg-accentPurple transition-colors hidden lg:block"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={18} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>

      {/* Logo / Title */}
      <motion.h2
        animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
        className="text-2xl font-display font-bold mb-8 whitespace-nowrap"
      >
        SuperAdmin
      </motion.h2>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => closeSidebar()} // auto-close on mobile navigation
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-secondary text-deepPurple font-semibold shadow-md"
                  : "hover:bg-secondary hover:text-deepPurple"
              }`}
            >
              <Icon size={20} />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
