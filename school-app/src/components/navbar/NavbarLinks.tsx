"use client";

export type Role = "TEACHER" | "ADMIN" | "STUDENT";

interface NavLink {
  name: string;
  href: string;
}

const linksConfig: Record<Role, NavLink[]> = {
  TEACHER: [
    { name: "Dashboard", href: "/teacher" },
    { name: "Attendance", href: "/teacher/attendance" },
    { name: "Assignments", href: "/teacher/assignments" },
    { name: "Grades", href: "/teacher/grades" },
    { name: "Messages", href: "/teacher/messages" },
    { name: "Timetable", href: "/teacher/timetable" },
  ],
  ADMIN: [
    { name: "Dashboard", href: "/admin" },
    { name: "Staff", href: "/admin/staff" },
    { name: "Students", href: "/admin/students" },
    { name: "Finance", href: "/admin/finance" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Settings", href: "/admin/settings" },
  ],
  STUDENT: [
    { name: "Dashboard", href: "/student" },
    { name: "Classes", href: "/student/classes" },
    { name: "Assignments", href: "/student/assignments" },
    { name: "Grades", href: "/student/grades" },
    { name: "Messages", href: "/student/messages" },
  ],
};

export function getLinksByRole(role: Role) {
  return linksConfig[role] || [];
}
