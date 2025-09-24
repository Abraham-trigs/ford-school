"use client";

import Link from "next/link";
import { useSidebarStore } from "@/lib/store/sidebarStore";
import { useSessionStore } from "@/lib/store/sessionStore";

interface RoleSidebarProps {
  onLinkClick?: () => void;
  role: string;
}

export default function RoleSidebar({ onLinkClick, role }: RoleSidebarProps) {
  // ✅ get helpers from sidebar store
  const {
    toggleSection,
    setSearch,
    getCollapsedSectionsForRole,
    getSearchForRole,
  } = useSidebarStore();

  // ✅ stable derived values
  const collapsedSections = getCollapsedSectionsForRole(role);
  const searchValue = getSearchForRole(role);
  const { isSuperAdmin } = useSessionStore();

  return (
    <aside className="p-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full mb-4 p-2 rounded bg-background border border-border text-textPrimary"
        value={searchValue}
        onChange={(e) => setSearch(role, e.target.value)}
      />

      {/* Example sections */}
      <div className="space-y-2">
        <button
          className="w-full text-left text-textPrimary"
          onClick={() => toggleSection(role, "dashboard")}
        >
          Dashboard {collapsedSections["dashboard"] ? "▲" : "▼"}
        </button>
        {!collapsedSections["dashboard"] && (
          <ul className="pl-4">
            <li>
              <Link href="/dashboard" onClick={onLinkClick}>
                Main Dashboard
              </Link>
            </li>
            {isSuperAdmin && (
              <li>
                <Link href="/admin" onClick={onLinkClick}>
                  Super Admin
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}
