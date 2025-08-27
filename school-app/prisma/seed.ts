import { PrismaClient, UserRole, AttendanceStatus, SubmissionStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Pre-hash the password once so all seeded users share the same login password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // -------------------------------
  // 1. Create Users by role
  // -------------------------------
  const teachers: string[] = [];
  const parents: string[] = [];
  const students: string[] = [];
  const admins: string[] = [];
  const headmasters: string[] = [];
  const proprietors: string[] = [];

  // Helper to create a user
  const createUser = async (role: UserRole) => {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword, // ✅ bcrypt hash instead of plain string
        role,
        phone: faker.phone.number(),
      },
    });
    return user.id;
  };

  for (let i = 0; i < 10; i++) {
    teachers.push(await createUser("TEACHER"));
    parents.push(await createUser("PARENT"));
    students.push(await createUser("STUDENT"));
    admins.push(await createUser("ADMIN"));
    headmasters.push(await createUser("HEADMASTER"));
    proprietors.push(await createUser("PROPRIETOR"));
  }

  // -------------------------------
  // 2. Create Classes
  // -------------------------------
  const classes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Class ${i + 1}`,
        teacherId: teachers[i % teachers.length],
      },
    });
    classes.push(cls.id);
  }

  // -------------------------------
  // 3. Assign Students to Classes
  // -------------------------------
  for (const studentId of students) {
    const clsId = classes[Math.floor(Math.random() * classes.length)];
    const teacherId = teachers[Math.floor(Math.random() * teachers.length)];
    const parentId = parents[Math.floor(Math.random() * parents.length)];

    await prisma.student.create({
      data: {
        id: studentId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        classId: clsId,
        teacherId,
        parentId,
        dob: faker.date.birthdate({ min: 10, max: 15, mode: "age" }),
        gender: faker.helpers.arrayElement(["M", "F"]),
        photoUrl: faker.image.avatar(),
      },
    });
  }

  // -------------------------------
  // 4. Create Attendance Records
  // -------------------------------
  const allStudents = await prisma.student.findMany();
  for (const student of allStudents) {
    for (let day = 1; day <= 5; day++) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date: new Date(`2025-08-${day + 20}`),
          status: faker.helpers.arrayElement(Object.values(AttendanceStatus)),
          recordedBy: student.teacherId,
          note: faker.lorem.sentence(),
        },
      });
    }
  }

  // -------------------------------
  // 5. Create Assignments
  // -------------------------------
  const assignments: string[] = [];
  for (const clsId of classes) {
    for (let i = 0; i < 2; i++) {
      const teacherId = teachers[Math.floor(Math.random() * teachers.length)];
      const assignment = await prisma.assignment.create({
        data: {
          title: `Assignment ${i + 1} - ${clsId}`,
          description: faker.lorem.sentence(),
          classId: clsId,
          createdBy: teacherId,
          dueDate: faker.date.soon({ days: 10 }),
        },
      });
      assignments.push(assignment.id);
    }
  }

  // -------------------------------
  // 6. Create Submissions
  // -------------------------------
  const allStudentsData = await prisma.student.findMany();
  const allAssignmentsData = await prisma.assignment.findMany();

  for (const assignment of allAssignmentsData) {
    const clsStudents = allStudentsData.filter((s) => s.classId === assignment.classId);
    for (const student of clsStudents) {
      await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: student.id,
          submittedAt: faker.datatype.boolean() ? faker.date.recent() : null,
          status: faker.helpers.arrayElement(Object.values(SubmissionStatus)),
          grade: faker.datatype.boolean() ? faker.number.int({ min: 50, max: 100 }) : null,
          feedback: faker.lorem.sentence(),
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
