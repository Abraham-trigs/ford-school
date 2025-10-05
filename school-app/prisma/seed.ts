// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("SuperSecret123!", 12);

  // ====== SuperAdmin ======
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      fullName: "Super Admin",
      role: "SUPERADMIN",
      humanId: "SYS-SUPERADMIN",
      profilePicture: "https://via.placeholder.com/150",
    },
  });

  const superAdmin = await prisma.superAdmin.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      metadata: {
        onboardingCompleted: true,
        department: "System",
        notes: "Initial superadmin account",
      },
      sessions: {
        create: [
          {
            token: "initial-superadmin-session-token",
            ipAddress: "127.0.0.1",
            userAgent: "seed-script",
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          },
        ],
      },
      schoolSessions: {
        create: [
          {
            name: "Default School Session",
            slug: "default-school-session",
            startDate: new Date("2025-09-01"),
            endDate: new Date("2026-06-30"),
            metadata: { seeded: true },
          },
        ],
      },
    },
    include: { schoolSessions: true },
  });

  const defaultSessionId = superAdmin.schoolSessions?.[0]?.id;
  if (!defaultSessionId) throw new Error("SuperAdmin school session not created");

  await prisma.userSchoolSession.upsert({
    where: { humanId: "SYS-SUPERADMIN" },
    update: {},
    create: {
      humanId: "SYS-SUPERADMIN",
      schoolSessionId: defaultSessionId,
      userId: superAdminUser.id,
      email: superAdminUser.email,
      password: hashedPassword,
      role: "SUPERADMIN",
      active: true,
    },
  });

  // ====== Teacher ======
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      email: "teacher@example.com",
      fullName: "John Teacher",
      role: "TEACHER",
      humanId: "SCH-TEACHER1",
      profilePicture: "https://via.placeholder.com/150",
      teacherProfile: {
        create: {
          employeeId: "T-001",
          hireDate: new Date("2020-01-01"),
          department: "Mathematics",
          qualification: "MSc Mathematics",
          specialization: "Algebra",
        },
      },
    },
  });

  await prisma.userSchoolSession.upsert({
    where: { humanId: "SCH-TEACHER1" },
    update: {},
    create: {
      humanId: "SCH-TEACHER1",
      schoolSessionId: defaultSessionId,
      userId: teacherUser.id,
      email: teacherUser.email,
      password: hashedPassword,
      role: "TEACHER",
      active: true,
    },
  });

  // ====== Student ======
  const studentUser = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      fullName: "Jane Student",
      role: "STUDENT",
      humanId: "SCH-STUDENT1",
      profilePicture: "https://via.placeholder.com/150",
      studentProfile: {
        create: {
          admissionNumber: "A-001",
          admissionDate: new Date("2025-09-01"),
          dateOfBirth: new Date("2012-05-10"),
          gender: "Female",
          currentGrade: "GRADE_6",
          status: "ACTIVE",
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentProfileId = studentUser.studentProfile?.id;
  if (!studentProfileId) throw new Error("Student profile not created");

  await prisma.userSchoolSession.upsert({
    where: { humanId: "SCH-STUDENT1" },
    update: {},
    create: {
      humanId: "SCH-STUDENT1",
      schoolSessionId: defaultSessionId,
      userId: studentUser.id,
      email: studentUser.email,
      password: hashedPassword,
      role: "STUDENT",
      active: true,
    },
  });

  // ====== Parent ======
  const parentUser = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: {},
    create: {
      email: "parent@example.com",
      fullName: "Mary Parent",
      role: "PARENT",
      humanId: "SCH-PARENT1",
      profilePicture: "https://via.placeholder.com/150",
      parentProfile: {
        create: {
          occupation: "Engineer",
          phoneNumber: "+123456789",
          address: "123 Main St",
          profilePicture: "https://via.placeholder.com/150",
        },
      },
    },
    include: { parentProfile: true },
  });

  const parentProfileId = parentUser.parentProfile?.id;
  if (!parentProfileId) throw new Error("Parent profile not created");

  await prisma.userSchoolSession.upsert({
    where: { humanId: "SCH-PARENT1" },
    update: {},
    create: {
      humanId: "SCH-PARENT1",
      schoolSessionId: defaultSessionId,
      userId: parentUser.id,
      email: parentUser.email,
      password: hashedPassword,
      role: "PARENT",
      active: true,
    },
  });

  // ====== Parent-Student Link ======
  await prisma.parentStudent.upsert({
    where: { studentId_parentProfileId: { studentId: studentProfileId, parentProfileId } },
    update: {},
    create: {
      studentId: studentProfileId,
      parentProfileId,
      parentUserId: parentUser.id,
      relationType: "Mother",
    },
  });

  // ====== Classroom ======
  const classroom = await prisma.classroom.upsert({
    where: { name_schoolSessionId: { name: "Grade 6A", schoolSessionId: defaultSessionId } },
    update: {},
    create: {
      name: "Grade 6A",
      gradeLevel: "GRADE_6",
      schoolSessionId: defaultSessionId,
      students: { connect: [{ id: studentProfileId }] },
    },
  });

  // ====== Course ======
  const course = await prisma.course.upsert({
    where: { code_schoolSessionId: { code: "MATH101", schoolSessionId: defaultSessionId } },
    update: {},
    create: {
      name: "Mathematics",
      code: "MATH101",
      description: "Basic Math course",
      schoolSessionId: defaultSessionId,
      teacherId: teacherUser.id,
      students: { connect: [{ id: studentUser.id }] },
    },
  });

  // ====== Assignment ======
  const assignment = await prisma.assignment.upsert({
    where: { title_courseId: { title: "Algebra Homework", courseId: course.id } },
    update: {},
    create: {
      title: "Algebra Homework",
      courseId: course.id,
      teacherId: teacherUser.id,
      type: "HOMEWORK",
      dueDate: new Date("2025-10-15"),
    },
  });

  // ====== Grade ======
  await prisma.grade.upsert({
    where: { userId_assignmentId: { userId: studentUser.id, assignmentId: assignment.id } },
    update: {},
    create: {
      userId: studentUser.id,
      courseId: course.id,
      assignmentId: assignment.id,
      value: 95,
      maxValue: 100,
      letter: "A",
      feedback: "Excellent work!",
    },
  });

  // ====== Transportation ======
  const transportation = await prisma.transportation.upsert({
    where: { routeName_schoolSessionId: { routeName: "Route A", schoolSessionId: defaultSessionId } },
    update: {},
    create: {
      schoolSessionId: defaultSessionId,
      routeName: "Route A",
      vehicleType: "BUS",
      vehicleNumber: "BUS-001",
      driverName: "Driver John",
      capacity: 40,
    },
  });

  await prisma.transportStop.createMany({
    skipDuplicates: true,
    data: [
      { transportationId: transportation.id, name: "Stop 1", orderIndex: 1, lat: 5.6037, lng: -0.187 },
      { transportationId: transportation.id, name: "Stop 2", orderIndex: 2, lat: 5.6147, lng: -0.202 },
    ],
  });

  // ====== Resource ======
  const resource = await prisma.resource.upsert({
    where: { sku: "RES-001" },
    update: {},
    create: {
      schoolSessionId: defaultSessionId,
      sku: "RES-001",
      name: "Math Textbook",
      category: "BOOK",
      price: 25,
      stockQuantity: 50,
    },
  });

  // ====== Purchase ======
  await prisma.purchase.upsert({
    where: { resourceId_buyerId: { resourceId: resource.id, buyerId: parentUser.id } },
    update: {},
    create: {
      resourceId: resource.id,
      buyerId: parentUser.id,
      quantity: 1,
      unitPrice: 25,
      totalAmount: 25,
      currency: "USD",
      status: "COMPLETED",
    },
  });

  // ====== Financial Transaction ======
  await prisma.financialTransaction.upsert({
    where: { schoolSessionId_type_createdById: { schoolSessionId: defaultSessionId, type: "FEE_PAYMENT", createdById: superAdminUser.id } },
    update: {},
    create: {
      schoolSessionId: defaultSessionId,
      type: "FEE_PAYMENT",
      amount: 25,
      currency: "USD",
      status: "COMPLETED",
      createdById: superAdminUser.id,
      updatedById: superAdminUser.id,
    },
  });

  console.log("✅ Database seeded safely with all entities!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
