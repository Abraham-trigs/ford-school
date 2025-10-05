import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ROLE_ROUTES: Record<string, string> = {
  SUPERADMIN: "/dashboard/superadmin/dashboard",
  ADMIN: "/dashboard/admin/dashboard",
  TEACHER: "/dashboard/teacher/dashboard",
  STUDENT: "/dashboard/student/dashboard",
  DEFAULT: "/dashboard",
};

export function useRedirectOnAuth() {
  const router = useRouter();
  const { user, loading } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
  }));

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const role = user.roles.find((r) => ROLE_ROUTES[r]);
    router.replace(ROLE_ROUTES[role!] || ROLE_ROUTES.DEFAULT);
  }, [user, loading, router]);
}
