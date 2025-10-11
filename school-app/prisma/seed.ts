// src/prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding single-school setup...");

  // Utility to hash passwords
  const hashPassword = async (password: string) => bcrypt.hash(password, 10);

  // 1. Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@formless.com" },
    update: {},
    create: {
      email: "superadmin@formless.com",
      name: "System Super Admin",
      password: await hashPassword("SuperAdmin@123"),
      role: Role.SUPERADMIN,
    },
  });

  // 2. School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin@formless.com" },
    update: {},
    create: {
      email: "admin@formless.com",
      name: "School Admin",
      password: await hashPassword("Admin@123"),
      role: Role.ADMIN,
    },
  });

  // 3. Teacher
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@formless.com" },
    update: {},
    create: {
      email: "teacher@formless.com",
      name: "Mr. Newton",
      password: await hashPassword("Teacher@123"),
      role: Role.TEACHER,
    },
  });

  console.table([
    { role: "SUPERADMIN", email: superAdmin.email },
    { role: "ADMIN", email: schoolAdmin.email },
    { role: "TEACHER", email: teacher.email },
  ]);

  console.log("✅ Seeding complete.");
}

main()
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
