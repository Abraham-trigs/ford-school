import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth/cookies";

export async function getCurrentUser() {
  const payload = await getUserFromCookie(); // { userId, role, schoolId }

  if (!payload) return null;

  const user = await prisma.userAccount.findUnique({
    where: { id: payload.userId },
    include: { schoolAccount: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    school: user.schoolAccount
      ? { id: user.schoolAccount.id, name: user.schoolAccount.name }
      : null,
  };
}
