"use client";

import { useUserStore } from "@/store/userStore";

export default function Topbar() {
  const user = useUserStore((state) => state.user);

  if (!user) return null;

  return (
    <header className="h-16 bg-deeper flex items-center justify-between px-6 text-lightGray shadow">
      <span className="font-semibold">{user.school.name}</span>
      <span>
        {user.email} ({user.role})
      </span>
    </header>
  );
}
