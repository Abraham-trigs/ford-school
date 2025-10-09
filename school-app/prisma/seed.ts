import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ Create Global Session for Super Admin
  const globalSession = await prisma.schoolSession.upsert({
    where: { id: "global-session" },
    update: {},
    create: {
      id: "global-session",
      name: "Global Super Admin Session",
      domain: "global",
    },
  });

  // 2️⃣ Create Super Admin
  const superAdminPassword = await bcrypt.hash("SuperSecure123!", 10);
  const superAdmin = await prisma.userSession.upsert({
    where: { email: "superadmin@formless.com" },
    update: {},
    create: {
      email: "superadmin@formless.com",
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
      schoolId: globalSession.id, // FK valid
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 3️⃣ Create a School Session for Admin
  const schoolSession = await prisma.schoolSession.upsert({
    where: { id: "springfield-session-2025" },
    update: {},
    create: {
      id: "springfield-session-2025",
      name: "Springfield High Session 2025",
      domain: "springfield.edu",
    },
  });

  // 4️⃣ Create Admin User
  const adminPassword = await bcrypt.hash("AdminSecure123!", 10);
  const adminUser = await prisma.userSession.upsert({
    where: { email: "admin@springfield.edu" },
    update: {},
    create: {
      email: "admin@springfield.edu",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      schoolId: schoolSession.id, // FK valid
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
