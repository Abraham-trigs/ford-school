"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import { LucideIcon, Home, Users, BookOpen } from "lucide-react"; // example icons
import Link from "next/link";

interface SidebarLink {
  label: string;
  icon: LucideIcon;
  path: string;
  roles: string[];
}

const links: SidebarLink[] = [
  {
    label: "Home",
    icon: Home,
    path: "/dashboard",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT"],
  },
  {
    label: "Users",
    icon: Users,
    path: "/dashboard/users",
    roles: ["ADMIN", "PRINCIPAL"],
  },
  {
    label: "Classes",
    icon: BookOpen,
    path: "/dashboard/classes",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useUserStore((state) => state.user);

  if (!user) return null; // hide if no user

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 220 }}
      className="bg-deepest h-screen text-lightGray flex flex-col transition-width duration-300"
    >
      <button
        className="p-4 text-lightGray"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "➡️" : "⬅️"}
      </button>

      <nav className="mt-4 flex-1 flex flex-col gap-2">
        {links
          .filter((link) => link.roles.includes(user.role))
          .map((link) => (
            <Link key={link.path} href={link.path}>
              <div className="flex items-center gap-3 p-3 hover:bg-deeper rounded cursor-pointer">
                <link.icon />
                {!collapsed && <span>{link.label}</span>}
              </div>
            </Link>
          ))}
      </nav>
    </motion.div>
  );
}
