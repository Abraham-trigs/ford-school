import { getUserFromCookie } from "@/lib/auth/cookies";
import ClientWrapper from "@/components/common/ClientWrapper";
import SuperadminDashboardClient from "@/components/SuperAdmin/SuperadminDashboardClient";

export default async function SuperadminPage() {
  const user = await getUserFromCookie();

  return (
    <ClientWrapper user={user}>
      <SuperadminDashboardClient />
    </ClientWrapper>
  );
}
