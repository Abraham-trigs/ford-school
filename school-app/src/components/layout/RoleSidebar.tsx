"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useSidebarStore } from "@/lib/store/SidebarStore";
import { useUsersStore } from "@/lib/store/UserStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import { getMenuForRole } from "@/lib/menus";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function RoleSidebar({
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // --- grab role directly from session store ---
  const role = useSessionStore((state) => state.user?.role ?? "");
  const firstName = useSessionStore(
    (state) => state.user?.name?.split(" ")[0]?.trim() ?? "User"
  );

  // --- grab sidebar state slices with selectors ---
  const roleCollapsedSections = useSidebarStore(
    (state) => state.collapsedSections[role] || {}
  );
  const roleSearch = useSidebarStore((state) => state.search[role] || "");
  const toggleSection = useSidebarStore((state) => state.toggleSection);
  const setSearch = useSidebarStore((state) => state.setSearch);

  // --- grab users store data (badges) ---
  const { staff, students, parents, totalUsers } = useUsersStore((state) => ({
    staff: state.staff,
    students: state.students,
    parents: state.parents,
    totalUsers: state.totalUsers,
  }));

  const badgeCounts: Record<string, number> = {
    staff: staff.length,
    students: students.length,
    parents: parents.length,
    users: totalUsers,
  };

  // --- sidebar close on outside click (mobile only) ---
  useEffect(() => {
    if (!mobileOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, setMobileOpen]);

  // --- filter menu ---
  const menu = getMenuForRole(role);
  const filteredMenu = menu.map((item) => {
    if (item.children) {
      const children = item.children.filter((child) =>
        child.label.toLowerCase().includes(roleSearch.toLowerCase())
      );
      return { ...item, children };
    }
    return item;
  });

  const getActiveKey = (href: string) => pathname?.startsWith(href);

  const renderBadge = (badgeKey?: string) => {
    if (!badgeKey) return null;
    const count = badgeCounts[badgeKey];
    if (!count) return null;
    return (
      <span className="bg-light text-wine px-2 py-0.5 rounded-full text-xs font-semibold">
        {count}
      </span>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-wine text-switch font-sans shadow-lg transform
        transition-transform duration-300 ease-in-out z-50
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:top-16 md:h-[calc(100%-4rem)]`}
    >
      <div className="p-4 text-xl font-display border-b border-light hidden md:block">
        {firstName}'s Dashboard
      </div>

      {/* Search input */}
      <div className="p-4 border-b border-light flex items-center gap-2">
        <MagnifyingGlassIcon className="w-5 h-5 text-switch" />
        <input
          type="text"
          placeholder="Search..."
          value={roleSearch}
          onChange={(e) => setSearch(role, e.target.value)}
          className="w-full px-2 py-1 rounded text-black focus:outline-none"
        />
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto mt-2">
        {filteredMenu.map((item) => (
          <div key={item.key} className="mb-1">
            {item.children ? (
              <>
                <button
                  className="w-full flex justify-between items-center px-4 py-2 font-semibold text-switch hover:bg-light hover:text-wine rounded"
                  onClick={() => toggleSection(role, item.key)}
                >
                  {item.label}
                  {roleCollapsedSections[item.key] ? (
                    <ChevronUpIcon className="w-4 h-4 text-switch" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-switch" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-max-h duration-300 ${
                    roleCollapsedSections[item.key] ? "max-h-40" : "max-h-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={`flex justify-between items-center px-8 py-2 rounded hover:bg-light hover:text-wine ${
                        getActiveKey(child.href)
                          ? "bg-light text-wine font-bold"
                          : "text-switch"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{child.label}</span>
                      {renderBadge(child.badgeKey)}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex justify-between items-center px-4 py-2 rounded hover:bg-light hover:text-wine ${
                  getActiveKey(item.href)
                    ? "bg-light text-wine font-bold"
                    : "text-switch"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                {renderBadge(item.badgeKey)}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
