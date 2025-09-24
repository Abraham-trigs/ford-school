"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { fetchSession, loggedIn, loading, setUser } = useSessionStore();

  // Fetch session once on mount
  useEffect(() => {
    fetchSession().catch((err) => {
      console.error("SessionProvider fetch error:", err);
      setUser(null); // ✅ safe now
    });
  }, [fetchSession, setUser]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return;

    if (!loggedIn) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [loggedIn, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
