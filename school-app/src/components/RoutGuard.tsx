// /components/RouteGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoaderModal from "@/components/layout/LoaderModal";

interface RouteGuardProps {
  children: ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { hydrated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isLoading && !user) {
      router.push("/login");
    }
  }, [hydrated, isLoading, user, router]);

  if (!hydrated || isLoading) return <LoaderModal />;

  if (!user) return null;

  return <>{children}</>;
}
