import "./globals.css";
import { ReactNode } from "react";
import { useUserStore } from "@/store/userStore";
import { getUserFromCookie } from "@/lib/auth/cookies";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieUser = await getUserFromCookie();

  useUserStore.getState().setUserFromCookie(cookieUser);

  return (
    <html lang="en">
      <body className="bg-background text-muted font-sans">{children}</body>
    </html>
  );
}
