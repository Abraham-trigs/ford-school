import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Super Admin
  const superAdminPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@formless.com" },
    update: {},
    create: {
      email: "superadmin@formless.com",
      name: "System Super Admin",
      password: superAdminPassword,
      role: "SUPERADMIN",
    },
  });

  // 2. Create a sample School
  const school = await prisma.school.upsert({
    where: { name: "Formless International" },
    update: {},
    create: {
      name: "Formless International",
      domain: "formless-school.com",
    },
  });

  // 3. Create School Admin
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin@formless-school.com" },
    update: {},
    create: {
      email: "admin@formless-school.com",
      name: "Formless School Admin",
      password: adminPassword,
      role: "ADMIN",
      schoolId: school.id,
    },
  });

  console.log({
    superAdmin,
    school,
    schoolAdmin,
  });
}

main()
  .then(async () => {
    console.log("✅ Database seeding completed.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
