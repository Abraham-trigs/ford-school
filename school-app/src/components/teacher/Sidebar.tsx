"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/teacher" },
  { name: "Attendance", href: "/teacher/attendance" },
  { name: "Assignments", href: "/teacher/assignments" },
  { name: "Grades", href: "/teacher/grades" },
  { name: "Messages", href: "/teacher/messages" },
  { name: "Timetable", href: "/teacher/timetable" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-wine text-back h-screen p-4 border-r border-light sticky top-0">
        <h1 className="text-xl font-bold mb-6">Teacher Panel</h1>
        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2 rounded transition ${
                pathname === link.href
                  ? "bg-light text-back"
                  : "hover:bg-light hover:text-back"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden absolute right-4 top-16 z-40 w-56 bg-wine border border-light rounded shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform origin-top ${
          isOpen
            ? "max-h-[1000px] p-4 scale-y-100 opacity-100"
            : "max-h-0 p-0 scale-y-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2 rounded transition ${
                pathname === link.href
                  ? "bg-light text-back"
                  : "hover:bg-light hover:text-back"
              }`}
              onClick={onClose}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
