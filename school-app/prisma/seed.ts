// import { PrismaClient, AttendanceStatus } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   const users: any[] = [];

//   // --- Create 20 Students ---
//   const students: any[] = [];
//   for (let i = 1; i <= 20; i++) {
//     const student = await prisma.user.create({
//       data: {
//         name: `Student ${i}`,
//         email: `student${i}@school.com`,
//         password: "password",
//         role: "STUDENT",
//         dob: new Date(2010, 0, i),
//         gender: i % 2 === 0 ? "Male" : "Female",
//       },
//     });
//     students.push(student);
//     users.push(student);
//   }

//   // --- Create 15 Parents (some with multiple children) ---
//   const parents: any[] = [];
//   let studentIndex = 0;
//   for (let i = 1; i <= 15; i++) {
//     const numChildren = i <= 5 ? 2 : 1; // first 5 parents have 2 children, rest have 1
//     const childrenToAssign = students.slice(studentIndex, studentIndex + numChildren);
//     studentIndex += numChildren;

//     const parent = await prisma.user.create({
//       data: {
//         name: `Parent ${i}`,
//         email: `parent${i}@school.com`,
//         password: "password",
//         role: "PARENT",
//         children: { connect: childrenToAssign.map((c) => ({ id: c.id })) },
//       },
//     });
//     parents.push(parent);
//     users.push(parent);
//   }

//   // --- Create 12 Teachers ---
//   const teachers: any[] = [];
//   for (let i = 1; i <= 12; i++) {
//     const teacher = await prisma.user.create({
//       data: {
//         name: `Teacher ${i}`,
//         email: `teacher${i}@school.com`,
//         password: "password",
//         role: "TEACHER",
//       },
//     });
//     teachers.push(teacher);
//     users.push(teacher);
//   }

//   // --- Create 10 Admins ---
//   for (let i = 1; i <= 10; i++) {
//     const admin = await prisma.user.create({
//       data: {
//         name: `Admin ${i}`,
//         email: `admin${i}@school.com`,
//         password: "password",
//         role: "ADMIN",
//       },
//     });
//     users.push(admin);
//   }

//   // --- Headmaster ---
//   const headmaster = await prisma.user.create({
//     data: {
//       name: `Headmaster`,
//       email: `headmaster@school.com`,
//       password: "password",
//       role: "HEADMASTER",
//     },
//   });
//   users.push(headmaster);

//   // --- Proprietor ---
//   const proprietor = await prisma.user.create({
//     data: {
//       name: `Proprietor`,
//       email: `proprietor@school.com`,
//       password: "password",
//       role: "PROPRIETOR",
//     },
//   });
//   users.push(proprietor);

//   // --- Create 12 Classes ---
//   const classes: any[] = [];
//   for (let i = 1; i <= 12; i++) {
//     const cls = await prisma.class.create({
//       data: {
//         name: `Class ${i}`,
//         teacherId: teachers[i - 1].id, // one teacher per class
//         students: {
//           connect: students.map((s) => ({ id: s.id })), // all students in every class
//         },
//       },
//     });
//     classes.push(cls);
//   }

//   // --- Create Attendance ---
//   for (const cls of classes) {
//     for (const student of students) {
//       await prisma.attendance.create({
//         data: {
//           classId: cls.id,
//           studentId: student.id,
//           date: new Date(),
//           status: [
//             AttendanceStatus.PRESENT,
//             AttendanceStatus.ABSENT,
//             AttendanceStatus.LATE,
//             AttendanceStatus.EXCUSED,
//           ][Math.floor(Math.random() * 4)],
//           recordedById: cls.teacherId!, // teacher of the class records
//         },
//       });
//     }
//   }

//   console.log("Seeding completed!");
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(async () => await prisma.$disconnect());
