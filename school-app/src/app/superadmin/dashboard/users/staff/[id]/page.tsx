"use client";

import { useParams, useRouter } from "next/navigation";
import UserDetailPage from "@/components/layout/UserDetailPage";

export default function UserDetailRoute() {
  const { id } = useParams(); // grabs the dynamic [id] from URL
  const router = useRouter();

  if (!id) return <p className="text-red-400">User ID not found.</p>;

  return <UserDetailPage userId={id} onBack={() => router.back()} />;
}
