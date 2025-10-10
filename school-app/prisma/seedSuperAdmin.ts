// prisma/seedSuperAdmin.ts
import { prisma } from "../src/lib/prisma.ts"; // relative path from prisma folder
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@formless.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "0243wethebestemailmarvellous";

  const existing = await prisma.userAccount.findUnique({ where: { email } });
  if (existing) {
    console.log("Super Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.userAccount.create({
    data: {
      email,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("Super Admin created:", superAdmin.email);
}

// Run the script
main()
  .catch((e) => {
    console.error("Error seeding Super Admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
