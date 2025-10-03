import { ReactNode } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/prisma";
import { authenticate } from "@/lib/auth";
import AuthProvider from "@/store/authStoreProvider";

export const metadata = {
  title: "Dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let initialUser = null;

  try {
    const token = cookies().get("token")?.value;
    if (token) {
      const payload: any = authenticate({
        headers: { get: () => `Bearer ${token}` },
      } as any);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { memberships: true },
      });

      if (user) {
        initialUser = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roles: payload.roles,
        };
      }
    }
  } catch (err) {
    console.warn("No valid session:", err);
  }

  return (
    <html lang="en">
      <body>
        {/* Hydrate authStore with server data */}
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
