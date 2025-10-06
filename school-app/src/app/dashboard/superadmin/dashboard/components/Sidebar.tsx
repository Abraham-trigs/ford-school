"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/ui/superadmin";
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

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard/superadmin/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Users",
    href: "/dashboard/superadmin/dashboard/Users",
    icon: Users,
  },
  { label: "Schools", href: "/schools", icon: School },
  { label: "Admissions", href: "/admissions", icon: FileText },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck },
  { label: "Exams", href: "/exams", icon: BookOpen },
  { label: "Finance", href: "/finance", icon: DollarSign },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Logout", href: "/logout", icon: LogOut },
];

export default function Sidebar({
  isMobile = false,
  closeMobile,
}: {
  isMobile?: boolean;
  closeMobile?: () => void;
}) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const width = !isMobile ? (sidebarCollapsed ? 80 : 260) : 260;
  const paddingClass = !isMobile ? (sidebarCollapsed ? "p-2" : "p-6") : "p-6";

  return (
    <motion.aside
      key="sidebar"
      animate={{ width }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-deepPurple text-secondary h-screen flex flex-col relative ${paddingClass}`}
    >
      {/* Desktop Collapse Button */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-accentTeal text-deepPurple p-1 rounded-full hover:bg-accentPurple transition-colors z-50"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      )}

      {/* Logo / Title */}
      <div className="text-2xl font-display font-bold mb-8 whitespace-nowrap">
        {!isMobile && !sidebarCollapsed && "SuperAdmin"}
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? closeMobile : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-secondary text-deepPurple font-semibold"
                  : "hover:bg-secondary hover:text-deepPurple"
              } ${!isMobile && sidebarCollapsed ? "justify-center" : ""}`}
            >
              <Icon size={20} />
              {!isMobile && !sidebarCollapsed && <span>{item.label}</span>}
              {isMobile && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
