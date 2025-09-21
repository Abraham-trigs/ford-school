import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("SuperAdmin123!", 10);

  // Create your SuperAdmin account
  const superAdmin = await prisma.user.upsert({
    where: { email: "abraham@fordschoolsltd.com" },
    update: {},
    create: {
      name: "Abraham B. Danfa",
      email: "abraham@fordschoolsltd.com",
      phone: "0208660068",
      password,
      role: "SUPERADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅ Seeded SuperAdmin:", superAdmin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
