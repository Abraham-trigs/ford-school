"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { fetchSession, role, setRole, clearRole } = useSessionStore();

  useEffect(() => {
    const init = async () => {
      await fetchSession();

      // ✅ Detect role based on pathname
      let detectedRole: string | null = null;

      if (pathname.startsWith("/teacher")) detectedRole = "TEACHER";
      else if (pathname.startsWith("/parent")) detectedRole = "PARENT";
      else if (pathname.startsWith("/student")) detectedRole = "STUDENT";
      else if (pathname.startsWith("/admin")) detectedRole = "ADMIN";
      else if (pathname.startsWith("/headmaster")) detectedRole = "HEADMASTER";
      else if (pathname.startsWith("/proprietor")) detectedRole = "PROPRIETOR";

      if (detectedRole) {
        if (!role) {
          // 🚨 No role in session → send to login
          router.replace("/login");
          return;
        }

        setRole(detectedRole);

        // ✅ Redirect if logged-in role doesn’t match the path
        if (role && role !== detectedRole) {
          router.replace(`/${role.toLowerCase()}`);
        }
      } else {
        clearRole();

        // ✅ If visiting protected area without role → redirect
        if (pathname !== "/" && pathname !== "/login") {
          router.replace("/login");
        }
      }
    };

    init();
  }, [pathname, fetchSession, setRole, clearRole, role, router]);

  return <>{children}</>;
}
