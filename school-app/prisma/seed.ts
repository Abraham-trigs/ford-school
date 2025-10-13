import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SuperSecurePassword123!', 10);

  // Upsert super admin
  await prisma.user.upsert({
    where: { email: 'superadmin@formless.app' },
    update: {}, // no update needed if exists
    create: {
      name: 'Super Admin',
      email: 'superadmin@formless.app',
      password: passwordHash,
      role: 'SUPER_ADMIN', // must match enum exactly
    },
  });

  console.log('🌱 Super Admin seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
