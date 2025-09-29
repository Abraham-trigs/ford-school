import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // --- 1. Create SuperAdmin ---
  const superAdminEmail = "superadmin@astir.com";
  const superAdminPassword = await bcrypt.hash("superadmin123", 10);

  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      name: "Super Admin",
      email: superAdminEmail,
      password: superAdminPassword,
    },
  });
  console.log(`✅ SuperAdmin ready: ${superAdminEmail}`);

  // --- 2. Create SchoolSession ---
  const session = await prisma.schoolSession.upsert({
    where: { slug: "default-session" },
    update: {},
    create: {
      name: "Default Session",
      slug: "default-session",
      superAdminId: superAdmin.id,
    },
  });
  console.log(`✅ SchoolSession ready: ${session.name}`);

  // --- 3. Create Staff user ---
  const staffEmail = "staff@astir.com";
  const staffPassword = await bcrypt.hash("staff123", 10);

  const staffUser = await prisma.user.upsert({
    where: { schoolSessionId_email: { schoolSessionId: session.id, email: staffEmail } },
    update: {},
    create: {
      email: staffEmail,
      password: staffPassword,
      fullName: "Staff Member",
      role: "ADMIN",
      schoolSessionId: session.id,
      staffProfile: {
        create: {
          employeeId: "EMP-0001",
          hireDate: new Date(),
          department: "Administration",
        },
      },
    },
  });
  console.log(`✅ Staff user ready: ${staffEmail}`);

  // --- 4. Create Teacher user ---
  const teacherEmail = "teacher@astir.com";
  const teacherPassword = await bcrypt.hash("teacher123", 10);

  const teacherUser = await prisma.user.upsert({
    where: { schoolSessionId_email: { schoolSessionId: session.id, email: teacherEmail } },
    update: {},
    create: {
      email: teacherEmail,
      password: teacherPassword,
      fullName: "John Teacher",
      role: "TEACHER",
      schoolSessionId: session.id,
      teacherProfile: {
        create: {
          employeeId: "EMP-0002",
          hireDate: new Date(),
        },
      },
    },
  });
  console.log(`✅ Teacher user ready: ${teacherEmail}`);

  // --- 5. Create Classrooms ---
  const classroom = await prisma.classroom.upsert({
    where: { id: "GRADE1-A" }, // Use a fixed ID for upsert uniqueness
    update: {},
    create: {
      id: "GRADE1-A",
      name: "Grade 1 - A",
      gradeLevel: "GRADE_1",
      schoolSessionId: session.id,
    },
  });
  console.log(`✅ Classroom ready: ${classroom.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
