import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

export type SchoolCreateInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  superAdminId: string;
  defaultAdminEmail: string;
  defaultAdminPassword: string;
};

/**
 * Creates a new school and automatically creates a default admin under the school.
 */
export const createSchool = async (data: SchoolCreateInput) => {
  const {
    name,
    email,
    phone,
    address,
    superAdminId,
    defaultAdminEmail,
    defaultAdminPassword,
  } = data;

  // Check if school exists
  const existingSchool = await prisma.schoolAccount.findUnique({ where: { name } });
  if (existingSchool) throw new Error("School already exists");

  // Hash default admin password
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);

  // Create school with default admin in a transaction
  const school = await prisma.$transaction(async (tx) => {
    const newSchool = await tx.schoolAccount.create({
      data: {
        name,
        email,
        phone,
        address,
        superAdminId,
      },
    });

    const defaultAdmin = await tx.userAccount.create({
      data: {
        email: defaultAdminEmail,
        passwordHash,
        role: "ADMIN",
        schoolId: newSchool.id,
        createdById: superAdminId,
      },
    });

    return newSchool;
  });

  return school;
};
