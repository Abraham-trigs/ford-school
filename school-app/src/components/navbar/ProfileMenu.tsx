"use client";

import { useState } from "react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-sea flex items-center justify-center text-white"
      >
        {/* Could be user initials or avatar */}
        JD
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded shadow-md z-50">
          <ul className="flex flex-col p-2 gap-2">
            <li>
              <a
                href="/profile"
                className="block p-2 hover:bg-sea hover:text-white rounded"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="/settings"
                className="block p-2 hover:bg-sea hover:text-white rounded"
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="/logout"
                className="block p-2 hover:bg-sea hover:text-white rounded"
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
