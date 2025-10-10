// /app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { getUserFromCookie } from "@/lib/auth/cookies";
import ClientWrapper from "@/components/common/ClientWrapper";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side: get user from cookie
  const user = await getUserFromCookie();

  return (
    <html lang="en">
      <body>
        {/* Wrap children with ClientWrapper to populate Zustand store */}
        <ClientWrapper user={user}>{children}</ClientWrapper>
      </body>
    </html>
  );
}
