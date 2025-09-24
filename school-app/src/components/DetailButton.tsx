"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface DetailButtonProps {
  id: string;
  name?: string;
  className?: string;
}

export default function DetailButton({
  id,
  name,
  className,
}: DetailButtonProps) {
  const pathname = usePathname(); // e.g., "/superadmin/dashboard/users/staff"

  // Remove any trailing slashes and append the user id
  const basePath = pathname.replace(/\/$/, "");
  const href = `${basePath}/${id}`;

  return (
    <Link
      href={href}
      className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-center rounded font-medium ${className}`}
    >
      {name ? `${name}` : "Details"}
    </Link>
  );
}
