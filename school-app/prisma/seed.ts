// prisma/seed.ts
import { PrismaClient, RoleType, GradeLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Start seeding...');

  // --- Clear existing data ---
  await prisma.userSchoolSession.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.superAdminSession.deleteMany();
  await prisma.superAdminProfile.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.schoolSession.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  console.log('Existing data cleared.');

  // --- Create master SuperAdmin user ---
  const superAdminPassword = await hashPassword('SuperAdmin@123');
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@astire.app',
      fullName: 'Master SuperAdmin',
      humanId: 'SYS-SA-001',
      role: RoleType.SUPERADMIN,
    },
  });
  console.log('SuperAdmin created:', superAdminUser.id);

  // --- Create SuperAdmin extension ---
  await prisma.superAdmin.create({
    data: {
      userId: superAdminUser.id,
      metadata: { note: 'Top-level admin' },
    },
  });

  // --- Create SuperAdmin Profile ---
  await prisma.superAdminProfile.create({
    data: {
      userId: superAdminUser.id,
      name: 'Master SuperAdmin',
      title: 'Founder',
      bio: 'The top system administrator.',
    },
  });

  // --- Create School Session ---
  const schoolSession = await prisma.schoolSession.create({
    data: {
      name: 'Bright Horizons Academy',
      slug: 'bha-2025',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      metadata: { setupComplete: true },
      superAdmin: { connect: { userId: superAdminUser.id } },
    },
  });
  console.log('SchoolSession created:', schoolSession.id);

  // --- Create School Admin ---
  const schoolAdminPassword = await hashPassword('Admin@123');
  const schoolAdminUser = await prisma.user.create({
    data: {
      email: 'admin@bha.edu',
      fullName: 'Alice Johnson',
      humanId: 'BHA-ADM-001',
      role: RoleType.ADMIN,
    },
  });

  await prisma.userSchoolSession.create({
    data: {
      humanId: 'BHA-ADM-001',
      userId: schoolAdminUser.id,
      schoolSessionId: schoolSession.id,
      email: schoolAdminUser.email,
      password: schoolAdminPassword,
      role: RoleType.ADMIN,
    },
  });
  console.log('School Admin created:', schoolAdminUser.id);

  // --- Create Teacher ---
  const teacherPassword = await hashPassword('Teacher@123');
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@bha.edu',
      fullName: 'Mr. David Smith',
      humanId: 'BHA-TCH-005',
      role: RoleType.TEACHER,
    },
  });

  await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
      name: 'Mr. David Smith',
      title: 'Senior Teacher',
      bio: 'Teaches Grade 5 English.',
      employeeId: 'BHA-TCH-005',
      hireDate: new Date('2023-08-01'),
    },
  });

  await prisma.userSchoolSession.create({
    data: {
      humanId: 'BHA-TCH-005',
      userId: teacherUser.id,
      schoolSessionId: schoolSession.id,
      email: teacherUser.email,
      password: teacherPassword,
      role: RoleType.TEACHER,
    },
  });
  console.log('Teacher created:', teacherUser.id);

  // --- Create Classroom ---
  const classroom = await prisma.classroom.create({
    data: {
      name: 'Grade 5A',
      gradeLevel: GradeLevel.GRADE_5,
      schoolSessionId: schoolSession.id,
      teacherId: teacherUser.id,
    },
  });
  console.log('Classroom created:', classroom.id);

  // --- Create Student ---
  const studentPassword = await hashPassword('Student@123');
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@bha.edu',
      fullName: 'Emily Davis',
      humanId: 'BHA-STU-010',
      role: RoleType.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      name: 'Emily Davis',
      admissionNumber: 'ADM-010',
      currentGrade: GradeLevel.GRADE_5,
      classroomId: classroom.id,
    },
  });

  await prisma.userSchoolSession.create({
    data: {
      humanId: 'BHA-STU-010',
      userId: studentUser.id,
      schoolSessionId: schoolSession.id,
      email: studentUser.email,
      password: studentPassword,
      role: RoleType.STUDENT,
    },
  });
  console.log('Student created:', studentUser.id);

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
