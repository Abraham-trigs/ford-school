import { PrismaClient, AttendanceStatus, SchoolRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// --- Names for realistic seeding ---
const studentNames = [ "Nii Armah", "Naa Dedei", "Kofi Adjei", "Akosua Aryee", "Yaw Quaye",
  "Afua Tetteh", "Kojo Laryea", "Abena Owoo", "Kwesi Ashong", "Ama Okine",
  "Mensah Tetteh", "Adjoa Adjetey", "Nii Kpakpo", "Naa Lamiley Yoo", "Yaw Sowah",
  "Maa Adjeley", "Kojo Addo", "Araba Aryee", "Nii Abbey", "Naa Afua",
  "Kwaku Odoi", "Abena Martey", "Yaw Okai", "Akosua Adjei", "Kojo Quaye",
  "Naa Koshie", "Kwame Tetteh", "Adjoa Laryea", "Nii Ayi", "Naa Ayeley",
  "Yaw Martey", "Maa Afriyie", "Kojo Okine", "Afua Torto", "Nii Tagoe",
  "Naa Koshie", "Kwabena Aryee", "Adjoa Addy", "Nii Adjeley", "Naa Atswei",
  "Yaw Sackey", "Maa Lamiley", "Kojo Abbey", "Akosua Quaye", "Nii Amarh",
  "Naa Oyeley", "Kwame Owoo", "Abena Tetteh", "Nii Ankrah", "Naa Aryee",
  "Yaw Ocloo", "Afua Sowah", "Kojo Aryee", "Akosua Tagoe", "Nii Laryea",
  "Naa Okailey", "Kwesi Adjetey", "Adjoa Martey", "Nii Akrong", "Naa Dromo",
  "Yaw Tetteh", "Maa Aryee", "Kojo Martey", "Afua Adjeley", "Nii Mettle",
  "Naa Afua", "Kwame Quaye", "Adjoa Owoo", "Nii Nortey", "Naa Tetteh",
  "Yaw Aryee", "Akosua Ayi", "Kojo Torto", "Abena Adjei", "Nii Ashong",
  "Naa Adjei", "Kwabena Okine", "Afua Laryea", "Nii Okai", "Naa Aryee",
  "Yaw Addo", "Adjoa Tetteh", "Kojo Sowah", "Ama Martey", "Nii Aryee",
  "Naa Lamiley", "Kwame Abbey", "Afua Quaye", "Nii Tagoe", "Naa Adjoa",
  "Yaw Odoi", "Akosua Aryee", "Kojo Owoo", "Maa Addy", "Nii Adjei",
  "Naa Atswei", "Kwesi Ocloo", "Abena Tagoe", "Nii Quaye", "Naa Okailey",];

const parentNames = [  "Mr. Armah", "Mrs. Armah", "Mr. Tetteh", "Mrs. Tetteh",
  "Mr. Quaye", "Mrs. Quaye", "Mr. Laryea", "Mrs. Laryea",
  "Mr. Okine", "Mrs. Okine", "Mr. Ocloo", "Mrs. Ocloo",
  "Mr. Sowah", "Mrs. Sowah", "Mr. Ashong", "Mrs. Ashong",
  "Mr. Abbey", "Mrs. Abbey", "Mr. Okai", "Mrs. Okai",
  "Mr. Adjetey", "Mrs. Adjetey", "Mr. Ankrah", "Mrs. Ankrah",
  "Mr. Aryee", "Mrs. Aryee", "Mr. Nortey", "Mrs. Nortey",
  "Mr. Tagoe", "Mrs. Tagoe", "Mr. Ayi", "Mrs. Ayi",
  "Mr. Addo", "Mrs. Addo", "Mr. Martey", "Mrs. Martey",
  "Mr. Adjei", "Mrs. Adjei", "Mr. Mettle", "Mrs. Mettle",
  "Mr. Sackey", "Mrs. Sackey", "Mr. Dromo", "Mrs. Dromo",
  "Mr. Akrong", "Mrs. Akrong", "Mr. Owoo", "Mrs. Owoo",
  "Mr. Aryee", "Mrs. Aryee", "Mr. Lamiley", "Mrs. Lamiley",
  "Mr. Afriyie", "Mrs. Afriyie", "Mr. Kpakpo", "Mrs. Kpakpo",
  "Mr. Atswei", "Mrs. Atswei", "Mr. Koshie", "Mrs. Koshie",
  "Mr. Dedei", "Mrs. Dedei", "Mr. Nmai", "Mrs. Nmai",
  "Mr. Ayeley", "Mrs. Ayeley", "Mr. Okra", "Mrs. Okra",
  "Mr. Owoo", "Mrs. Owoo Obaa", "Mr. Amon", "Mrs. Amon",
  "Mr. Quartey", "Mrs. Quartey", "Mr. Sowah", "Mrs. Sowah",
  "Mr. Adjeley", "Mrs. Adjeley", "Mr. Afua", "Mrs. Afua",
  "Mr. Kofi", "Mrs. Kofi", "Mr. Nii", "Mrs. Naa",];

const teacherNames = [
  "Dashboard Teacher", "John Adams", "Emily Clark", "Michael Lewis", "Sarah Hall",
  "William Allen", "Jessica Young", "David Hernandez", "Laura King", "Richard Wright",
  "Olivia Scott", "Thomas Baker",
];

// --- Helper to generate unique emails ---
function emailFromName(name: string, index: number) {
  return `${name.toLowerCase().replace(/\s+/g, ".")}.${index}@fordschool.com`;
}

async function main() {
  // 🔥 Clean tables before seeding (safe reseeding)
  await prisma.attendance.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const users: any[] = [];

  // --- Students ---
  const students: any[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const student = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: emailFromName(studentNames[i], i),
        password: await bcrypt.hash("password", 10),
        role: SchoolRole.STUDENT,
        dob: new Date(2010, i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? "Male" : "Female",
      },
    });
    students.push(student);
    users.push(student);
  }

  // --- Parents ---
  const parents: any[] = [];
  let studentIndex = 0;
  for (let i = 0; i < parentNames.length; i++) {
    const numChildren = i < 40 ? 2 : 1;
    const children = students.slice(studentIndex, studentIndex + numChildren);
    studentIndex += numChildren;

    const parent = await prisma.user.create({
      data: {
        name: parentNames[i],
        email: emailFromName(parentNames[i], i),
        password: await bcrypt.hash("password", 10),
        role: SchoolRole.PARENT,
        children: { connect: children.map((c) => ({ id: c.id })) },
      },
    });
    parents.push(parent);
    users.push(parent);
  }

  // --- Teachers ---
  const teachers: any[] = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const teacher = await prisma.user.create({
      data: {
        name: teacherNames[i],
        email: emailFromName(teacherNames[i], i),
        password: await bcrypt.hash(i === 0 ? "Teacher123!" : "password", 10),
        role: SchoolRole.TEACHER,
      },
    });
    teachers.push(teacher);
    users.push(teacher);
  }

  // --- Admins ---
  for (let i = 1; i <= 10; i++) {
    const admin = await prisma.user.create({
      data: {
        name: `Admin ${i}`,
        email: `admin${i}@fordschool.com`,
        password: await bcrypt.hash("password", 10),
        role: SchoolRole.ADMIN,
      },
    });
    users.push(admin);
  }

  // --- Headmaster & Proprietor ---
  const headmaster = await prisma.user.create({
    data: {
      name: "Headmaster",
      email: "headmaster@fordschool.com",
      password: await bcrypt.hash("password", 10),
      role: SchoolRole.HEADMASTER,
    },
  });
  users.push(headmaster);

  const proprietor = await prisma.user.create({
    data: {
      name: "Proprietor",
      email: "proprietor@fordschool.com",
      password: await bcrypt.hash("password", 10),
      role: SchoolRole.PROPRIETOR,
    },
  });
  users.push(proprietor);

  // --- Classes (20 students per class, 12 classes) ---
  const classes: any[] = [];
  for (let i = 0; i < 12; i++) {
    const classStudents = students.slice(i * 20, i * 20 + 20);
    const cls = await prisma.class.create({
      data: {
        name: `Class ${i + 1}`,
        teacherId: teachers[i].id,
        students: { connect: classStudents.map((s) => ({ id: s.id })) },
      },
    });
    classes.push(cls);
  }

  // --- Attendance (past 7 days) ---
  for (const cls of classes) {
    const classWithStudents = await prisma.class.findUnique({
      where: { id: cls.id },
      include: { students: true },
    });

    for (const student of classWithStudents!.students) {
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);

        await prisma.attendance.create({
          data: {
            classId: cls.id,
            studentId: student.id,
            date,
            status: [
              AttendanceStatus.PRESENT,
              AttendanceStatus.ABSENT,
              AttendanceStatus.LATE,
              AttendanceStatus.EXCUSED,
            ][Math.floor(Math.random() * 4)] as AttendanceStatus,
            recordedById: cls.teacherId!,
          },
        });
      }
    }
  }

  console.log("✅ Seeding completed!");
  console.log(
    "🔑 Dashboard Teacher login -> Email: dashboard.teacher.0@fordschool.com | Password: Teacher123!"
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });





// 🔑 Dashboard Teacher login -> Email: dashboard.teacher.0@fordschool.com | Password: Teacher123!


  
//   Students & Parents & Teachers (except the dashboard teacher):
// 👉 All have password: await bcrypt.hash("password", 10)
// So their login password is just password.
// Their email is auto-generated with this pattern:

// name.toLowerCase().replace(/\s+/g, ".") + "." + index + "@fordschool.com"


// Example:

// Student "Nii Armah" at index 0 → nii.armah.0@fordschool.com

// Parent "Mr. Armah" at index 0 → mr..armah.0@fordschool.com
