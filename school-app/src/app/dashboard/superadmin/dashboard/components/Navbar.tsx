"use client";

import { Menu } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export default function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="bg-secondary p-4 flex justify-between items-center shadow-md">
      {/* Left side: hamburger (mobile only) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden bg-accentTeal text-deepPurple p-2 rounded-md hover:bg-accentPurple transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Center title */}
      <h1 className="text-deepPurple font-display font-bold text-xl">
        Dashboard
      </h1>

      {/* Right side: logout */}
      <button className="bg-accentTeal text-deepPurple px-4 py-2 rounded-lg hover:bg-accentPurple transition-colors duration-300">
        Logout
      </button>
    </header>
  );
}
