// types/school.ts

export enum UserRole {
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
  HEADMASTER = "HEADMASTER",
  PROPRIETOR = "PROPRIETOR",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  dob?: string;
  gender?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  teacherClasses?: Class[];   // if role = TEACHER
  children?: User[];          // if role = PARENT
  parent?: User;              // if role = STUDENT
  classesAttended?: Class[];  // if role = STUDENT
  attendanceAsStudent?: Attendance[];
  attendanceRecorded?: Attendance[];
}

export interface Class {
  id: string;
  name: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;

  teacher?: User;       // role = TEACHER
  students?: User[];    // role = STUDENT
  attendances?: Attendance[];
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string; // ISO string
  status: AttendanceStatus;
  note?: string;
  recordedById: string;
  createdAt: string;
  updatedAt?: string;

  // Relations
  class: Class;
  student: User;      // role = STUDENT
  recordedBy: User;   // teacher/admin who recorded
}

// Derived type if you still want a shortcut for Student
export type Student = User & { role: UserRole.STUDENT };
