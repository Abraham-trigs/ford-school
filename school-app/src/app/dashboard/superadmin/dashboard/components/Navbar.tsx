"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "../store/uiStore";
import { Menu, Bell, Settings, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const menuItems = [
  { label: "Dashboard", href: "/dashboard/superadmin/dashboard" },
  { label: "Users Management", href: "/dashboard/superadmin/dashboard/users" },
  {
    label: "Schools Management",
    href: "/dashboard/superadmin/dashboard/schools",
  },
  { label: "Admissions", href: "/dashboard/superadmin/dashboard/admissions" },
  { label: "Attendance", href: "/dashboard/superadmin/dashboard/attendance" },
  { label: "Exams & Results", href: "/dashboard/superadmin/dashboard/exams" },
  { label: "Finance", href: "/dashboard/superadmin/dashboard/finance" },
  { label: "Reports", href: "/dashboard/superadmin/dashboard/reports" },
  { label: "Settings", href: "/dashboard/superadmin/dashboard/settings" },
];

export default function Navbar() {
  const { toggleMobileSidebar, screenWidth } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(screenWidth <= 425);

    const handleResize = () => setIsMobile(window.innerWidth <= 425);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [screenWidth]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <header className="bg-secondary p-4 flex justify-between items-center shadow-md relative z-10">
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="bg-accentTeal text-deepPurple p-2 rounded-lg hover:bg-accentPurple transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-deepPurple font-display font-bold text-xl">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4 relative" ref={profileRef}>
        <button
          className="relative p-2 rounded-full hover:bg-accentPurple transition-colors"
          onClick={() => setProfileOpen((prev) => !prev)}
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div
          className="flex items-center gap-2 bg-accentTeal px-3 py-1 rounded-lg cursor-pointer"
          onClick={() => setProfileOpen((prev) => !prev)}
        >
          <span className="w-6 h-6 rounded-full bg-deepPurple"></span>
          <span className="text-deepPurple font-semibold text-sm">Admin</span>
        </div>

        {/* Profile Dropdown */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 bg-secondary rounded-md w-40 flex flex-col p-2 gap-1"
            >
              <DropdownItem icon={User} label="Profile" />
              <DropdownItem icon={Settings} label="Settings" />
              <DropdownItem icon={LogOut} label="Logout" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 top-16 bg-secondary rounded-md w-56 flex flex-col p-2 gap-1 z-50 shadow-md"
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded hover:bg-accentPurple transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accentPurple transition-colors">
      <Icon size={18} />
      <span className="text-deepPurple text-sm">{label}</span>
    </button>
  );
}
