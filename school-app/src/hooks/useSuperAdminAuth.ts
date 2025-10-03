
// hooks/useSuperAdminAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSuperAdminSessionStore } from "@/store/superAdminSessionStore";

export function useSuperAdminAuth() {
  const router = useRouter();
  const loggedIn = useSuperAdminSessionStore((state) => state.loggedIn);

  useEffect(() => {
    if (!loggedIn) router.push("/superadmin/login");
  }, [loggedIn, router]);
}
