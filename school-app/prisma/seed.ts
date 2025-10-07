// prisma/seed.ts
import { PrismaClient, RoleType, GradeLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Start seeding...');

  // --- Clear existing data ---
  await prisma.superAdminSession.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.superAdminProfile.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.userSchoolSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.schoolSession.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  console.log('Existing data cleared.');

  // --- Create the master SuperAdmin ---
  const superAdminPassword = await hashPassword('SuperAdmin@123');
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@astire.app',
      fullName: 'Master SuperAdmin',
      humanId: 'SYS-SA-001',
      role: RoleType.SUPERADMIN,
      superAdminMeta: { create: { sessions: { create: [] } } },
      superAdminProfile: { create: { name: 'Master SuperAdmin', title: 'Founder', bio: 'The top system administrator.' } },
    },
  });
  console.log(`Created Super Admin user with ID: ${superAdminUser.id}`);

  // --- Create a school session ---
  const schoolSession = await prisma.schoolSession.create({
    data: {
      superAdminId: superAdminUser.id,
      name: 'Bright Horizons Academy',
      slug: 'bha-2025',
      startDate: new Date('2025-09-01T00:00:00Z'),
      endDate: new Date('2026-06-30T00:00:00Z'),
      metadata: { setupComplete: true },
    },
  });
  console.log(`Created School Session with ID: ${schoolSession.id}`);

  // --- Create a School Admin ---
  const schoolAdminPassword = await hashPassword('Admin@123');
  const schoolAdminUser = await prisma.user.create({
    data: {
      email: 'admin@bha.edu',
      fullName: 'Alice Johnson',
      humanId: 'BHA-ADM-001',
      role: RoleType.ADMIN,
      schoolMemberships: {
        create: {
          schoolSessionId: schoolSession.id,
          email: 'admin@bha.edu',
          password: schoolAdminPassword,
          role: RoleType.ADMIN,
          humanId: 'BHA-ADM-001',
        },
      },
    },
  });
  console.log(`Created School Admin user with ID: ${schoolAdminUser.id}`);

  // --- Create a Teacher ---
  const teacherPassword = await hashPassword('Teacher@123'); // ✅ define before use
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@bha.edu',
      fullName: 'Mr. David Smith',
      humanId: 'BHA-TCH-005',
      role: RoleType.TEACHER,
      teacherProfile: {
        create: {
          name: 'Mr. David Smith',
          bio: 'Teaches Grade 5 English.',
          title: 'Senior Teacher',
          employeeId: 'BHA-TCH-005', // required
          hireDate: new Date('2023-08-01T00:00:00Z'), // required
        },
      },
      schoolMemberships: {
        create: {
          schoolSessionId: schoolSession.id,
          email: 'teacher@bha.edu',
          password: teacherPassword,
          role: RoleType.TEACHER,
          humanId: 'BHA-TCH-005',
        },
      },
    },
  });
  console.log(`Created Teacher user with ID: ${teacherUser.id}`);

  // --- Create a Classroom and add the Teacher ---
const classroom = await prisma.classroom.create({
  data: {
    name: 'Grade 5A',
    gradeLevel: GradeLevel.GRADE_5,
    schoolSession: { connect: { id: schoolSession.id } },
    teacher: { connect: { id: teacherUser.id } },
  },
});
  
  console.log(`Created Classroom with ID: ${classroom.id}`);

  // --- Create a Student ---
  const studentPassword = await hashPassword('Student@123');
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@bha.edu',
      fullName: 'Emily Davis',
      humanId: 'BHA-STU-010',
      role: RoleType.STUDENT,
      studentProfile: {
        create: {
          name: 'Emily Davis',
          admissionNumber: 'ADM-010',
          currentGrade: GradeLevel.GRADE_5,
          classroom: { connect: { id: classroom.id } },
        },
      },
      schoolMemberships: {
        create: {
          schoolSession: { connect: { id: schoolSession.id } },
          email: 'student@bha.edu',
          password: studentPassword,
          role: RoleType.STUDENT,
          humanId: 'BHA-STU-010',
        },
      },
    },
  });
  console.log(`Created Student user with ID: ${studentUser.id}`);

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
