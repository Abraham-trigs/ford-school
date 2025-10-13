import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth/jwt";

const prisma = new PrismaClient();

export const loginUser = async (email: string, password: string) => {
  // Lookup user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Invalid credentials");

  // Validate password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  // Create tokens using shared JWT helpers
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    role: user.role,
  });

  // Return safe user data + tokens
  return { user, accessToken, refreshToken };
};
