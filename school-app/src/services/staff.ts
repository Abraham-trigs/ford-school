import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";

interface PostBodySchema {
  email: string;
  fullName: string;
  password: string;
  profilePicture?: string;
  role: string;
  schoolSessionId: string;
  profileData?: {
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE";
  };
}

/**
 * Creates a new staff member in a transaction.
 * Handles user creation, staff profile, and membership.
 */
export async function createStaff(
  data: PostBodySchema,
  requesterId: string,
  roles: string[]
) {
  const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = data;

  // Check if the requester has access to this school session
  const isAdmin = roles.includes("SUPERADMIN") || await prisma.userSchoolSession.findFirst({
    where: { userId: requesterId, schoolSessionId, active: true }
  });

  if (!isAdmin) throw new Error("Forbidden");

  const hashed = await bcrypt.hash(password, 12);

  // Transaction to ensure atomic creation
  const staffUser = await prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: { email, fullName, profilePicture }
    });

    await tx.userSchoolSession.create({
      data: { userId: user.id, email, password: hashed, role, schoolSessionId, active: true }
    });

    await tx.staffProfile.create({
      data: { ...profileData, userId: user.id }
    });

    return user;
  });

  return staffUser;
}
