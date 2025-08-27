import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // -------------------------------
  // 1. Create Teachers
  // -------------------------------
  const teachers = [];
  for (let i = 1; i <= 3; i++) {
    const teacher = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "hashedpassword",
        role: "TEACHER",
        phone: faker.phone.number(),
      },
    });
    teachers.push(teacher);
  }

  // -------------------------------
  // 2. Create Parents
  // -------------------------------
  const parents = [];
  for (let i = 1; i <= 5; i++) {
    const parent = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "hashedpassword",
        role: "PARENT",
        phone: faker.phone.number(),
      },
    });
    parents.push(parent);
  }

  // -------------------------------
  // 3. Create Classes
  // -------------------------------
  const classes = [];
  for (let i = 1; i <= 3; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Class ${i}`,
        teacherId: teachers[i - 1].id,
      },
    });
    classes.push(cls);
  }

  // -------------------------------
  // 4. Create Students
  // -------------------------------
  const students = [];
  for (let i = 0; i < 10; i++) {
    const cls = classes[i % classes.length];
    const teacher = teachers.find((t) => t.id === cls.teacherId)!;
    const parent = parents[i % parents.length];

    const student = await prisma.student.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        classId: cls.id,
        teacherId: teacher.id,
        parentId: parent.id,
        dob: faker.date.birthdate({ min: 10, max: 15, mode: "age" }),
        gender: faker.helpers.arrayElement(["M", "F"]),
        photoUrl: faker.image.avatar(),
      },
    });
    students.push(student);
  }

  // -------------------------------
  // 5. Create Attendance Records
  // -------------------------------
  const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
  for (const student of students) {
    for (let day = 1; day <= 5; day++) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date: new Date(`2025-08-${day + 20}`),
          status: faker.helpers.arrayElement(statuses),
          recordedBy: student.teacherId,
          note: faker.lorem.sentence(),
        },
      });
    }
  }

  // -------------------------------
  // 6. Create Assignments
  // -------------------------------
  const assignments = [];
  for (const cls of classes) {
    for (let i = 1; i <= 2; i++) {
      const assignment = await prisma.assignment.create({
        data: {
          title: `Assignment ${i} - ${cls.name}`,
          description: faker.lorem.sentence(),
          classId: cls.id,
          createdBy: cls.teacherId!,
          dueDate: faker.date.soon({ days: 10 }),
        },
      });
      assignments.push(assignment);
    }
  }

  // -------------------------------
  // 7. Create Submissions
  // -------------------------------
  const submissionStatuses = ["SUBMITTED", "LATE", "MISSING"] as const;

  for (const assignment of assignments) {
    const clsStudents = students.filter((s) => s.classId === assignment.classId);
    for (const student of clsStudents) {
      await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: student.id,
          submittedAt: faker.datatype.boolean() ? faker.date.recent() : null,
          status: faker.helpers.arrayElement(submissionStatuses),
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
