import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { UserSession } from "@prisma/client"

export async function loginUser(email: string, password: string, schoolId: string) {
  const user = await prisma.userSession.findFirst({
    where: { email, schoolId },
    include: { school: true }
  });
  if (!user) throw new Error("Invalid credentials");

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) throw new Error("Invalid credentials");

  const accessToken = signAccessToken({ userId: user.id, schoolId: user.schoolId, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Save refresh token in DB
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function logoutUser(refreshToken: string) {
  await prisma.session.deleteMany({ where: { token: refreshToken } });
}
