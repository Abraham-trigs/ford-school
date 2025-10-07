// /app/layout.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { setupApiClient } from "@/lib/apiClient";
import RouteGuard from "@/components/RoutGuard";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { refreshUser, setAccessToken, logout, accessToken } = useAuthStore();

  const getAccessToken = () => accessToken;

  useEffect(() => {
    setupApiClient(getAccessToken, setAccessToken, logout);
    refreshUser();
  }, []);

  return <RouteGuard>{children}</RouteGuard>;
}
