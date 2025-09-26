"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function DashboardRedirect() {
  const router = useRouter();
  const { fullUserData: user } = useSessionStore();

  useEffect(() => {
    if (!user) return;
    // redirect to role-based page
    router.replace(`/dashboard/${user.role.toLowerCase()}`);
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-full">
      Redirecting...
    </div>
  );
}
