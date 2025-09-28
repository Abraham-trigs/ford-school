import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface LoginInput {
  email: string;
  password: string;
  schoolId?: number;
  device?: string;
  ip?: string;
}

export async function loginUser({ email, password, schoolId, device, ip }: LoginInput) {
  let user;

  // SUPER_ADMIN bypasses schoolId
  if (email === "superadmin@school.com") {
    user = await prisma.user.findFirst({
      where: { email, role: { name: "SUPER_ADMIN" } },
      include: { role: true, school: true },
    });
  } else {
    if (!schoolId) throw new Error("schoolId is required for non-super-admin users");
    user = await prisma.user.findUnique({
      where: { schoolId_email: { email, schoolId } },
      include: { role: true, school: true },
    });
  }

  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(password, user.password!);
  if (!isValid) throw new Error("Invalid password");

  // Create JWT tokens
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role.name, schoolId: user.schoolId },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || "superrefreshsecret",
    { expiresIn: "7d" }
  );

  // Optional: create/update session log here using device/ip

  const sessionContext = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    schoolId: user.schoolId,
  };

  return { accessToken, refreshToken, sessionContext };
}
