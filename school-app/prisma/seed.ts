import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding initial users...");

  const password = await bcrypt.hash("password123", 10);

// 1️⃣ Super Admin (platform-level)
const superAdmin = await prisma.user.upsert({
  where: { email: "superadmin@formless.app" },
  update: {},
  create: {
    firstName: "Super",
    lastName: "Admin",
    email: "superadmin@formless.app",
    password,
    role: "SUPER_ADMIN",
  },
});

// 2️⃣ Admin (school-level)
const admin = await prisma.user.upsert({
  where: { email: "admin@formless.app" },
  update: {},
  create: {
    firstName: "Admin",
    lastName: "User",
    email: "admin@formless.app",
    password,
    role: "ADMIN",
  },
});

  console.log("✅ Seed complete!");
  console.log({ superAdmin, admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
