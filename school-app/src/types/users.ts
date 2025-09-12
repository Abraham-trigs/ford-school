// types/school.ts
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
  teacherId: string;
  parentId?: string;
  dob?: string;
  gender?: "M" | "F";
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
  students?: Student[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  teacherClasses?: Class[];
  children?: Student[];
  taughtStudents?: Student[];
}

// ---------------- Attendance ----------------
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string; // ISO string from DateTime
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; // matches AttendanceStatus enum
  note?: string;
  recordedById: string;
  student: Student; // populated via include
  class: Class;     // populated via include
  createdAt: string;
  updatedAt?: string; // optional if you want to track updates
}



export enum UserRole {
  TEACHER = "TEACHER",
  PARENT = "PARENT",
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  HEADMASTER = "HEADMASTER",
  PROPRIETOR = "PROPRIETOR",
}
