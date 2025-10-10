import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Runtime checks
if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET is not defined");
if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is not defined");

export const loginUser = async (email: string, password: string, schoolId?: string) => {
  let user;

  if (schoolId) {
    // Look for a user with schoolId first
    user = await prisma.userAccount.findFirst({
      where: { email, schoolId },
      include: { schoolAccount: true },
    });
  } else {
    // If no schoolId, check if this is SUPER_ADMIN
    user = await prisma.userAccount.findFirst({
      where: { email, role: "SUPER_ADMIN" },
    });
  }

  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error("Invalid credentials");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, schoolId: user.schoolId || null },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  return { user, accessToken, refreshToken };
};
