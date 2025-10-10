import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRoleGuard(allowedRoles: string[]) {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      router.push("/dashboard"); // redirect if role not allowed
    }
  }, [user, allowedRoles, router]);

  return user; // may be null initially, handle in component
}
