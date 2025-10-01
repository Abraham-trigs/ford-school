import {
  LayoutDashboard,
  Users,
  School,
  Settings,
  FileText,
  BookOpen,
  CalendarCheck,
  DollarSign,
  LogOut,
} from "lucide-react";

export const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard/superadmin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users Management",
    href: "/dashboard/superadmin/dashboard/users",
    icon: Users,
  },
  {
    label: "Schools Management",
    href: "/dashboard/superadmin/dashboard/schools",
    icon: School,
  },
  {
    label: "Admissions",
    href: "/dashboard/superadmin/dashboard/admissions",
    icon: FileText,
  },
  {
    label: "Attendance",
    href: "/dashboard/superadmin/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Exams & Results",
    href: "/dashboard/superadmin/dashboard/exams",
    icon: BookOpen,
  },
  {
    label: "Finance",
    href: "/dashboard/superadmin/dashboard/finance",
    icon: DollarSign,
  },
  {
    label: "Reports",
    href: "/dashboard/superadmin/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/superadmin/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];
