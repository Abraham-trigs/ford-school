// prisma/seed.ts
import { PrismaClient, RoleType, GradeLevel, StudentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const superAdminPassword = await bcrypt.hash("password123", 10);

async function main() {
  // 1️⃣ SuperAdmin
  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: "superadmin@astir.com" },
    update: {},
    create: {
      email: "superadmin@astir.com",
      name: "Super Admin",
      password: superAdminPassword,
    },
  });
  console.log(`✅ SuperAdmin ready: ${superAdmin.email}`);

  // 2️⃣ Default SchoolSession
  const defaultSession = await prisma.schoolSession.upsert({
    where: { slug: "default-session" },
    update: {},
    create: {
      name: "Default Session",
      slug: "default-session",
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      superAdminId: superAdmin.id,
    },
  });
  console.log(`✅ SchoolSession ready: ${defaultSession.name}`);

  // 3️⃣ Helper function for users
  const passwordHash = await bcrypt.hash("password123", 10);

  async function createUser({
    email,
    fullName,
    role,
    humanId,
    profileData,
    include,
  }: {
    email: string;
    fullName: string;
    role: string;
    humanId: string;
    profileData?: any;
    include?: any;
  }) {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName,
        memberships: {
          create: {
            schoolSessionId: defaultSession.id,
            role,
            email,
            password: passwordHash,
            humanId,
          },
        },
        ...profileData,
      },
      include,
    });
  }

  // 4️⃣ Staff
  const staff = await createUser({
    email: "staff@astir.com",
    fullName: "Staff Member",
    role: RoleType.ADMIN,
    humanId: "EMP-0001",
    profileData: {
      staffProfile: {
        create: {
          employeeId: "EMP-0001",
          hireDate: new Date(),
          department: "Administration",
        },
      },
    },
    include: { staffProfile: true },
  });
  console.log(`✅ Staff ready: ${staff.email}`);

  // 5️⃣ Teacher
  const teacher = await createUser({
    email: "teacher@astir.com",
    fullName: "John Teacher",
    role: RoleType.TEACHER,
    humanId: "TCH-0001",
    profileData: {
      teacherProfile: {
        create: {
          employeeId: "TCH-0001",
          hireDate: new Date(),
          department: "Mathematics",
        },
      },
    },
    include: { teacherProfile: true },
  });
  console.log(`✅ Teacher ready: ${teacher.email}`);

  // 6️⃣ Student
  const student = await createUser({
    email: "student@astir.com",
    fullName: "Jane Student",
    role: RoleType.STUDENT,
    humanId: "STD-0001",
    profileData: {
      studentProfile: {
        create: {
          admissionNumber: "STD-0001",
          admissionDate: new Date(),
          currentGrade: GradeLevel.GRADE_10,
          status: StudentStatus.ACTIVE,
        },
      },
    },
    include: { studentProfile: true },
  });
  console.log(`✅ Student ready: ${student.email}`);

  // 7️⃣ Parent
  const parent = await createUser({
    email: "parent@astir.com",
    fullName: "Paul Parent",
    role: RoleType.PARENT,
    humanId: "PRT-0001",
    profileData: {
      parentProfile: {
        create: {
          phoneNumber: "123-456-7890",
          address: "123 Parent Street",
        },
      },
    },
    include: { parentProfile: true },
  });
  console.log(`✅ Parent ready: ${parent.email}`);

  // 8️⃣ Link Parent ↔ Student
  await prisma.parentStudent.upsert({
    where: {
      parentUserId_studentId: {
        parentUserId: parent.id,
        studentId: student.studentProfile.id,
      },
    },
    update: {},
    create: {
      parentUserId: parent.id,
      studentId: student.studentProfile.id,
      parentProfileId: parent.parentProfile.id,
      relationType: "Father",
    },
  });
  console.log(`✅ Linked Parent ${parent.email} to Student ${student.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
