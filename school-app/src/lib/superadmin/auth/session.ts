import { prisma } from "@/lib/prisma/prisma";

interface CreateSessionOptions {
  superAdminId: number;
  token: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

/**
 * Create a new superadmin session.
 */
export async function createSession({
  superAdminId,
  token,
  expiresAt,
  userAgent,
  ipAddress,
}: CreateSessionOptions) {
  return prisma.superAdminSession.create({
    data: {
      superAdminId,
      token,
      expiresAt,
      revoked: false,
      userAgent,
      ipAddress,
    },
  });
}

/**
 * Revoke sessions for a superadmin.
 * If token is passed → revoke only that session. If not → revoke all.
 */
export async function revokeSessions(
  superAdminId: number,
  options?: { token?: string }
) {
  return prisma.superAdminSession.updateMany({
    where: {
      superAdminId,
      revoked: false,
      ...(options?.token ? { token: options.token } : {}),
    },
    data: { revoked: true },
  });
}
