// app/dashboard/superadmin/page.tsx
import ClientWrapper from "@/components/common/ClientWrapper";
import SuperadminDashboardClient from "@/components/SuperAdmin/SuperadminDashboardClient";
import { getUserFromCookie } from "@/lib/auth/cookies";
import { JWTPayload } from "@/lib/auth/jwt";

export default async function SuperadminPage() {
  // Fetch the user from the refresh token (server-side)
  const user: JWTPayload | null = await getUserFromCookie();

  // Guard: only SUPER_ADMIN can access
  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="p-6 text-red-500 text-center font-semibold">
        Unauthorized
      </div>
    );
  }

  // Wrap the client component to hydrate the Zustand store
  return (
    <ClientWrapper user={user}>
      <SuperadminDashboardClient />
    </ClientWrapper>
  );
}
