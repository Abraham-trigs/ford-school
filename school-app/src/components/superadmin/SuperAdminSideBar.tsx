"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

type BadgeCounts = {
  users?: number;
  students?: number;
  staff?: number;
  paymentsPending?: number;
};

export default function SuperAdminSideBar() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({});

  // Placeholder: Fetch badge counts from API
  useEffect(() => {
    async function fetchCounts() {
      // Replace with your API calls
      const counts = {
        users: 150,
        students: 120,
        staff: 30,
        paymentsPending: 5,
      };
      setBadgeCounts(counts);
    }
    fetchCounts();
  }, []);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menu = [
    {
      label: "Dashboard",
      key: "dashboard",
      href: "/dashboard",
      badge: badgeCounts.users,
    },
    {
      label: "Users",
      key: "users",
      children: [
        {
          label: "Staff",
          key: "staff",
          href: "/superadmin/dashboard/users/staff",
          badge: badgeCounts.staff,
        },
        {
          label: "Students",
          key: "students",
          href: "/users/students",
          badge: badgeCounts.students,
        },
        { label: "Parents", key: "parents", href: "/users/parents" },
        { label: "Roles & Permissions", key: "roles", href: "/users/roles" },
      ],
    },
    {
      label: "Finance",
      key: "finance",
      children: [
        {
          label: "Payments",
          key: "payments",
          href: "/finance/payments",
          badge: badgeCounts.paymentsPending,
        },
        { label: "Invoices", key: "invoices", href: "/finance/invoices" },
        {
          label: "Income/Expense",
          key: "incomeExpense",
          href: "/finance/income-expense",
        },
      ],
    },
    { label: "Attendance", key: "attendance", href: "/attendance" },
    { label: "Academic", key: "academic", href: "/academic" },
    { label: "Assets", key: "assets", href: "/assets" },
    { label: "Library", key: "library", href: "/library" },
    { label: "Transport", key: "transport", href: "/transport" },
    { label: "Events & Announcements", key: "events", href: "/events" },
    { label: "Visitors", key: "visitors", href: "/visitors" },
  ];

  // Filter menu based on search input
  const filteredMenu = menu.map((item) => {
    if (item.children) {
      const children = item.children.filter((child) =>
        child.label.toLowerCase().includes(search.toLowerCase())
      );
      return { ...item, children };
    }
    return item;
  });

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden flex justify-between items-center bg-wine text-switch p-4">
        <span className="font-display text-lg">SuperAdmin</span>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-wine text-switch font-sans shadow-lg transform
          transition-transform duration-300 ease-in-out z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="p-4 text-xl font-display border-b border-light hidden md:block">
          SuperAdmin
        </div>

        {/* Search / Quick Access */}
        <div className="p-4 border-b border-light flex items-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-switch" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 rounded text-black focus:outline-none"
          />
        </div>

        <nav className="flex-1 overflow-y-auto mt-2">
          {filteredMenu.map(
            (item) =>
              (item.children?.length ?? 1) > 0 && (
                <div key={item.key} className="mb-1">
                  {item.children ? (
                    <>
                      <button
                        className="w-full flex justify-between items-center px-4 py-2 font-semibold text-switch hover:bg-light hover:text-wine rounded"
                        onClick={() => toggleSection(item.key)}
                      >
                        {item.label}
                        {collapsedSections[item.key] ? (
                          <ChevronUpIcon className="w-4 h-4 text-switch" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-switch" />
                        )}
                      </button>
                      <div
                        className={`overflow-hidden transition-max-h duration-300 ${
                          collapsedSections[item.key] ? "max-h-40" : "max-h-0"
                        }`}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.key}
                            href={child.href}
                            className={`flex justify-between items-center px-8 py-2 rounded hover:bg-light hover:text-wine ${
                              activeTab === child.key
                                ? "bg-light text-wine font-bold"
                                : "text-switch"
                            }`}
                            onClick={() => {
                              setActiveTab(child.key);
                              setMobileOpen(false);
                            }}
                          >
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className="bg-light text-wine px-2 py-0.5 rounded-full text-xs font-semibold">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex justify-between items-center px-4 py-2 rounded hover:bg-light hover:text-wine ${
                        activeTab === item.key
                          ? "bg-light text-wine font-bold"
                          : "text-switch"
                      }`}
                      onClick={() => {
                        setActiveTab(item.key);
                        setMobileOpen(false);
                      }}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="bg-light text-wine px-2 py-0.5 rounded-full text-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              )
          )}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
