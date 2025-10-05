"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, User } from "@/store/authStore";

// Map singular roles to their dashboard routes
const ROLE_ROUTES: Record<User["role"], string> = {
  SUPERADMIN: "/dashboard/superadmin/dashboard",
  ADMIN: "/dashboard/admin/dashboard",
  TEACHER: "/dashboard/teacher/dashboard",
  STUDENT: "/dashboard/student/dashboard",
  PARENT: "/dashboard/parent/dashboard",
};

export function useRedirectOnAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
  }));

  useEffect(() => {
    // Wait until loading finishes or user is not authenticated
    if (loading || !user) return;

    const targetRoute = ROLE_ROUTES[user.role] ?? "/dashboard";

    // Only redirect if we're not already on the target route
    if (pathname !== targetRoute) {
      router.replace(targetRoute);
    }
  }, [user, loading, pathname, router]);
}
