// app/dashboard/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Users", href: "/dashboard/users" },
  { label: "Schools", href: "/dashboard/schools" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-deepPurple text-secondary w-64 flex-shrink-0 h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-display font-bold mb-8">SuperAdmin</h2>
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              pathname === item.href
                ? "bg-secondary text-deepPurple font-semibold"
                : "hover:bg-secondary hover:text-deepPurple"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
