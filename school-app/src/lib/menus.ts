// File: /lib/menus.ts
export type MenuItem = {
  label: string;
  key: string;
  href?: string;
  badgeKey?: string; // key to fetch badge count dynamically
  children?: MenuItem[];
};

export type RoleMenus = Record<string, MenuItem[]>;

export function getMenuForRole(role: string) {
  return menusByRole[role.toLowerCase()] || [];
}

export const menusByRole: RoleMenus = {
  superadmin: [
    {
      label: "Dashboard",
      key: "dashboard",
      href: "/superadmin/dashboard",
      badgeKey: "users", // total users
    },
    {
      label: "Users",
      key: "users",
      children: [
        { label: "Staff", key: "staff", href: "/superadmin/dashboard/users/staff", badgeKey: "staff" },
        { label: "Students", key: "students", href: "/superadmin/dashboard/users/students", badgeKey: "students" },
        { label: "Parents", key: "parents", href: "/superadmin/dashboard/users/parents", badgeKey: "parents" },
        { label: "Roles & Permissions", key: "roles", href: "/superadmin/dashboard/users/roles" },
      ],
    },
    {
      label: "Finance",
      key: "finance",
      children: [
        { label: "Payments", key: "payments", href: "/superadmin/dashboard/finance/payments", badgeKey: "paymentsPending" },
        { label: "Invoices", key: "invoices", href: "/superadmin/dashboard/finance/invoices" },
        { label: "Income/Expense", key: "incomeExpense", href: "/superadmin/dashboard/finance/income-expense" },
      ],
    },
    { label: "Attendance", key: "attendance", href: "/superadmin/dashboard/attendance" },
    { label: "Academic", key: "academic", href: "/superadmin/dashboard/academic" },
    { label: "Assets", key: "assets", href: "/superadmin/dashboard/assets" },
    { label: "Library", key: "library", href: "/superadmin/dashboard/library" },
    { label: "Transport", key: "transport", href: "/superadmin/dashboard/transport" },
    { label: "Events & Announcements", key: "events", href: "/superadmin/dashboard/events" },
    { label: "Visitors", key: "visitors", href: "/superadmin/dashboard/visitors", badgeKey: "visitors" },
  ],

  teacher: [
    { label: "Dashboard", key: "dashboard", href: "/teacher/dashboard" },
    { label: "My Classes", key: "classes", href: "/teacher/dashboard/classes" },
    { label: "Attendance", key: "attendance", href: "/teacher/dashboard/attendance" },
    { label: "Exams & Grades", key: "exams", href: "/teacher/dashboard/exams" },
  ],

  student: [
    { label: "Dashboard", key: "dashboard", href: "/student/dashboard" },
    { label: "My Courses", key: "courses", href: "/student/dashboard/courses" },
    { label: "Attendance", key: "attendance", href: "/student/dashboard/attendance" },
    { label: "Grades", key: "grades", href: "/student/dashboard/grades" },
  ],

  parent: [
    { label: "Dashboard", key: "dashboard", href: "/parent/dashboard" },
    { label: "My Children", key: "children", href: "/parent/dashboard/children", badgeKey: "children" },
    { label: "Attendance", key: "attendance", href: "/parent/dashboard/attendance" },
    { label: "Payments", key: "payments", href: "/parent/dashboard/payments", badgeKey: "paymentsPending" },
  ],
};
