import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

export const loginUser = async (email: string, password: string) => {
  // Lookup by email only; school is inferred from user relationship
  const user = await prisma.user.findFirst({
    where: { email },
    include: { school: true },
  });

  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  const accessToken = jwt.sign({ id: user.id, role: user.role, schoolId: user.schoolId }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

  return { user, accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
};
