"use client";
import { useEffect } from "react";
import "./globals.css";
import { useUserStore } from "@/store/userStore";
import axios from "axios";

export default function RootLayout({ children }: { children: ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [setUser]);

  return (
    <html lang="en">
      <body className="bg-background text-muted font-sans">{children}</body>
    </html>
  );
}
