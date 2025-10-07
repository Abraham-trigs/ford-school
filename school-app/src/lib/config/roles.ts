// /lib/config/roles.ts
export const rolesWithSchool = [
  "ADMIN","PRINCIPAL","VICE_PRINCIPAL","TEACHER","ASSISTANT_TEACHER",
  "COUNSELOR","LIBRARIAN","EXAM_OFFICER","FINANCE","HR","RECEPTIONIST",
  "IT_SUPPORT","TRANSPORT","NURSE","COOK","CLEANER","SECURITY","MAINTENANCE",
  "STUDENT","CLASS_REP","PARENT",
] as const;

export const systemRoles = ["SUPERADMIN", "ADMIN"] as const;

export const profileRoles: Record<string, string> = {
  STUDENT: "studentProfile",
  PARENT: "parentProfile",
  TEACHER: "teacherProfile",
  PRINCIPAL: "teacherProfile",
  VICE_PRINCIPAL: "teacherProfile",
  FINANCE: "staffProfile",
  HR: "staffProfile",
  RECEPTIONIST: "staffProfile",
  IT_SUPPORT: "staffProfile",
  TRANSPORT: "staffProfile",
  NURSE: "staffProfile",
  COOK: "staffProfile",
  CLEANER: "staffProfile",
  SECURITY: "staffProfile",
  MAINTENANCE: "staffProfile",
  SUPERADMIN: "superAdminMeta",
};
