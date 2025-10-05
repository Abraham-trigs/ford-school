// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("SuperSecret123!", 12);

  // ====== SuperAdmin ======
  const superAdminUser = await prisma.user.create({
    data: {
      email: "superadmin@example.com",
      fullName: "Super Admin",
      role: "SUPERADMIN",
      humanId: "SYS-SUPERADMIN",
      profilePicture: "https://via.placeholder.com/150",
    },
  });

  const superAdmin = await prisma.superAdmin.create({
    data: {
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
            expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
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

  // ====== UserSchoolSession ======
  await prisma.userSchoolSession.create({
    data: {
      humanId: "SYS-SUPERADMIN",
      schoolSessionId: superAdmin.schoolSessions[0].id,
      userId: superAdminUser.id,
      email: superAdminUser.email,
      password: hashedPassword,
      role: "SUPERADMIN",
      active: true,
    },
  });

  // ====== Teacher ======
  const teacherUser = await prisma.user.create({
    data: {
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

  await prisma.userSchoolSession.create({
    data: {
      humanId: "SCH-TEACHER1",
      schoolSessionId: superAdmin.schoolSessions[0].id,
      userId: teacherUser.id,
      email: teacherUser.email,
      password: hashedPassword,
      role: "TEACHER",
      active: true,
    },
  });

  // ====== Student ======
  const studentUser = await prisma.user.create({
    data: {
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
  });

  await prisma.userSchoolSession.create({
    data: {
      humanId: "SCH-STUDENT1",
      schoolSessionId: superAdmin.schoolSessions[0].id,
      userId: studentUser.id,
      email: studentUser.email,
      password: hashedPassword,
      role: "STUDENT",
      active: true,
    },
  });

  // ====== Parent ======
  const parentUser = await prisma.user.create({
    data: {
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
  });

  await prisma.userSchoolSession.create({
    data: {
      humanId: "SCH-PARENT1",
      schoolSessionId: superAdmin.schoolSessions[0].id,
      userId: parentUser.id,
      email: parentUser.email,
      password: hashedPassword,
      role: "PARENT",
      active: true,
    },
  });

  // ====== Link Parent-Student ======
  await prisma.parentStudent.create({
    data: {
      studentId: studentUser.studentProfile!.id,
      parentProfileId: parentUser.parentProfile!.id,
      parentUserId: parentUser.id,
      relationType: "Mother",
    },
  });

  // ====== Classroom ======
  const classroom = await prisma.classroom.create({
    data: {
      name: "Grade 6A",
      gradeLevel: "GRADE_6",
      schoolSessionId: superAdmin.schoolSessions[0].id,
      students: { connect: [{ id: studentUser.studentProfile!.id }] },
    },
  });

  // ====== Course ======
  const course = await prisma.course.create({
    data: {
      name: "Mathematics",
      code: "MATH101",
      description: "Basic Math course",
      schoolSessionId: superAdmin.schoolSessions[0].id,
      teacherId: teacherUser.id,
      students: { connect: [{ id: studentUser.id }] },
    },
  });

  // ====== Assignment ======
  const assignment = await prisma.assignment.create({
    data: {
      title: "Algebra Homework",
      courseId: course.id,
      teacherId: teacherUser.id,
      type: "HOMEWORK",
      dueDate: new Date("2025-10-15"),
    },
  });

  // ====== Grade ======
  await prisma.grade.create({
    data: {
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
  const transportation = await prisma.transportation.create({
    data: {
      schoolSessionId: superAdmin.schoolSessions[0].id,
      routeName: "Route A",
      vehicleType: "BUS",
      vehicleNumber: "BUS-001",
      driverName: "Driver John",
      capacity: 40,
    },
  });

  await prisma.transportStop.createMany({
    data: [
      { transportationId: transportation.id, name: "Stop 1", orderIndex: 1, lat: 5.6037, lng: -0.1870 },
      { transportationId: transportation.id, name: "Stop 2", orderIndex: 2, lat: 5.6147, lng: -0.2020 },
    ],
  });

  // ====== Resource ======
  const resource = await prisma.resource.create({
    data: {
      schoolSessionId: superAdmin.schoolSessions[0].id,
      sku: "RES-001",
      name: "Math Textbook",
      category: "BOOK",
      price: 25,
      stockQuantity: 50,
    },
  });

  // ====== Purchase ======
  const purchase = await prisma.purchase.create({
    data: {
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
  await prisma.financialTransaction.create({
    data: {
      schoolSessionId: superAdmin.schoolSessions[0].id,
      type: "FEE_PAYMENT",
      amount: 25,
      currency: "USD",
      status: "COMPLETED",
      createdById: superAdminUser.id,
      updatedById: superAdminUser.id,
    },
  });

  console.log("✅ Database seeded with SuperAdmin, Users, Profiles, Classes, Courses, Assignments, Grades, Transportation, Resources, Purchases, and Financials.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
