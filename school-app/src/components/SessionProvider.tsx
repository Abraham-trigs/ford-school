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
  const { fetchSession, loggedIn, role, setRole, clearRole } =
    useSessionStore();

  // ✅ Fetch session once on mount
  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Handle redirects when path or role changes
  useEffect(() => {
    let detectedRole: string | null = null;

    if (pathname.startsWith("/teacher")) detectedRole = "TEACHER";
    else if (pathname.startsWith("/parent")) detectedRole = "PARENT";
    else if (pathname.startsWith("/student")) detectedRole = "STUDENT";
    else if (pathname.startsWith("/admin")) detectedRole = "ADMIN";
    else if (pathname.startsWith("/headmaster")) detectedRole = "HEADMASTER";
    else if (pathname.startsWith("/proprietor")) detectedRole = "PROPRIETOR";

    if (detectedRole) {
      if (!loggedIn) {
        router.replace("/login");
        return;
      }

      setRole(detectedRole);

      if (role && role !== detectedRole) {
        router.replace(`/${role.toLowerCase()}`);
      }
    } else {
      clearRole();

      if (pathname !== "/" && pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, [pathname, loggedIn, role, setRole, clearRole, router]);

  return <>{children}</>;
}
