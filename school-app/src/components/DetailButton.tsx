"use client";

import Link from "next/link";

interface DetailButtonProps {
  id: string;
  name?: string;
  basePath: string;
  className?: string;
}

export default function DetailButton({
  id,
  name,
  basePath,
  className,
}: DetailButtonProps) {
  const slug = name?.toLowerCase().replace(/\s+/g, "-") || id;
  return (
    <Link
      href={`${basePath}/${slug}`}
      className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-center rounded font-medium ${className}`}
    >
      Details
    </Link>
  );
}
