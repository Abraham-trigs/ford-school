// lib/prisma/includes.ts
import { Prisma } from "@prisma/client";

// Utility type for optional overrides
type RelationOptions<T> = Partial<{ [K in keyof T]: T[K] }>;

// Helper to merge includes
const mergeInclude = <T>(base: T, options?: RelationOptions<T>): T => {
  if (!options) return base;
  return { ...base, ...options };
};

// ----------------- BASE INCLUDES -----------------

export const userLightBase: Prisma.UserInclude = {
  role: true,
  status: true,
  student: { select: { sectionId: true, rollNo: true } },
  staff: { select: { position: true } },
};

export const userFullBase: Prisma.UserInclude = {
  role: true,
  status: true,
  staff: true,
  student: true,
  parentOf: true,
  parents: true,
  payments: true,
  issuedPayments: true,
  invoices: true,
  attendanceRecords: true,
  createdEvents: true,
  events: true,
  borrowedBooks: true,
  drivingVehicles: true,
  issuedDisciplineLogs: true,
  createdAnnouncements: true,
  createdVisitorLogs: true,
  visitedVisitorLogs: true,
  approvedVisitorLogs: true,
  classActivities: true,
  attendanceSessionsTaken: true,
  promotionsDecided: true,
  schoolExpensesPaid: true,
  schoolIncomesRecorded: true,
  departments: true,
  sectionsTaught: true,
  timetables: true,
  performedAssetLogs: true,
};

export const studentLightBase: Prisma.StudentInclude = {
  user: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
};

export const studentFullBase: Prisma.StudentInclude = {
  user: true,
  section: true,
  parents: true,
  parentOf: true,
  promotions: true,
  classActivities: true,
};

export const staffLightBase: Prisma.StaffInclude = {
  user: { select: { id: true, name: true } },
};

export const staffFullBase: Prisma.StaffInclude = {
  user: true,
  salaries: true,
  departments: true,
};

export const sectionLightBase: Prisma.SectionInclude = {
  teacher: { select: { id: true, name: true } },
  students: { select: { id: true, userId: true } },
};

export const sectionFullBase: Prisma.SectionInclude = {
  teacher: true,
  students: true,
  attendanceSessions: true,
  exams: true,
  department: true,
  timetables: true,
};

export const examLightBase: Prisma.ExamInclude = {
  section: { select: { id: true, name: true } },
};

export const examFullBase: Prisma.ExamInclude = {
  section: true,
  classActivities: true,
};

export const classActivityLightBase: Prisma.ClassActivityInclude = {
  teacher: { select: { id: true, name: true } },
  student: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
};

export const classActivityFullBase: Prisma.ClassActivityInclude = {
  teacher: true,
  student: true,
  subject: true,
  exam: true,
};

export const invoiceLightBase: Prisma.InvoiceInclude = {
  user: { select: { id: true, name: true } },
  receipts: { select: { id: true, status: true } },
};

export const invoiceFullBase: Prisma.InvoiceInclude = {
  user: true,
  receipts: true,
};

export const paymentLightBase: Prisma.PaymentInclude = {
  user: { select: { id: true, name: true } },
  issuedBy: { select: { id: true, name: true } },
};

export const paymentFullBase: Prisma.PaymentInclude = {
  user: true,
  issuedBy: true,
};

export const rolePermissionLightBase: Prisma.RolePermissionInclude = {
  resources: { select: { resourceName: true } },
};

export const rolePermissionFullBase: Prisma.RolePermissionInclude = {
  role: true,
  actions: true,
  resources: true,
  groupType: true,
  groupId: true,
};

export const assetLightBase: Prisma.AssetInclude = {};
export const assetFullBase: Prisma.AssetInclude = {};

export const assetLogLightBase: Prisma.AssetLogInclude = {
  performedBy: { select: { id: true, name: true } },
};
export const assetLogFullBase: Prisma.AssetLogInclude = {
  performedBy: true,
  asset: true,
};

export const visitorLogLightBase: Prisma.VisitorLogInclude = {
  createdBy: { select: { id: true, name: true } },
  visitedUser: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};
export const visitorLogFullBase: Prisma.VisitorLogInclude = {
  createdBy: true,
  visitedUser: true,
  approvedBy: true,
};

export const schoolEventLightBase: Prisma.SchoolEventInclude = {
  createdBy: { select: { id: true, name: true } },
};
export const schoolEventFullBase: Prisma.SchoolEventInclude = {
  createdBy: true,
  participants: true,
};

export const timetableLightBase: Prisma.TimetableInclude = {
  teacher: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
};
export const timetableFullBase: Prisma.TimetableInclude = {
  teacher: true,
  section: true,
  subject: true,
};

export const libraryLogLightBase: Prisma.LibraryLogInclude = {
  user: { select: { id: true, name: true } },
};
export const libraryLogFullBase: Prisma.LibraryLogInclude = {
  user: true,
};

export const transportVehicleLightBase: Prisma.TransportVehicleInclude = {
  driver: { select: { id: true, name: true } },
};
export const transportVehicleFullBase: Prisma.TransportVehicleInclude = {
  driver: true,
};

export const disciplineLogLightBase: Prisma.DisciplineLogInclude = {
  issuedBy: { select: { id: true, name: true } },
};
export const disciplineLogFullBase: Prisma.DisciplineLogInclude = {
  issuedBy: true,
  student: true,
};

export const announcementLightBase: Prisma.AnnouncementInclude = {};
export const announcementFullBase: Prisma.AnnouncementInclude = {
  createdBy: true,
};

export const promotionLightBase: Prisma.PromotionInclude = {};
export const promotionFullBase: Prisma.PromotionInclude = {
  student: true,
  decidedBy: true,
};

// ----------------- SESSION INCLUDES -----------------

export const sessionLightBase: Prisma.SessionDataInclude = {
  user: { select: { id: true, name: true, roleId: true } },
  pagesVisited: true,
  clicks: true,
  keyboardInputs: true,
  bookmarks: true,
  userSessionUpdates: true,
};

export const sessionBrowserLightBase: Prisma.SessionDataInclude = {
  externalPagesVisited: true,
  localStorageData: true,
  sessionStorageData: true,
  cookiesData: true,
  mouseMovements: true,
  scrollPositions: true,
  activeTime: true,
};

// Full session include combines both in-app and browser-level activity
export const sessionFullBase: Prisma.SessionDataInclude = {
  ...sessionLightBase,
  ...sessionBrowserLightBase,
};

// ----------------- DYNAMIC GETTERS -----------------
export const getSessionInclude = (
  options?: RelationOptions<Prisma.SessionDataInclude>,
  useFull = false
) => mergeInclude(useFull ? sessionFullBase : sessionLightBase, options);

export const getSessionBrowserInclude = (
  options?: RelationOptions<Prisma.SessionDataInclude>
) => mergeInclude(sessionBrowserLightBase, options);

export const getUserInclude = (options?: RelationOptions<Prisma.UserInclude>, useFull = false) =>
  mergeInclude(useFull ? userFullBase : userLightBase, options);

export const getStudentInclude = (options?: RelationOptions<Prisma.StudentInclude>, useFull = false) =>
  mergeInclude(useFull ? studentFullBase : studentLightBase, options);

export const getStaffInclude = (options?: RelationOptions<Prisma.StaffInclude>, useFull = false) =>
  mergeInclude(useFull ? staffFullBase : staffLightBase, options);

export const getSectionInclude = (options?: RelationOptions<Prisma.SectionInclude>, useFull = false) =>
  mergeInclude(useFull ? sectionFullBase : sectionLightBase, options);

export const getExamInclude = (options?: RelationOptions<Prisma.ExamInclude>, useFull = false) =>
  mergeInclude(useFull ? examFullBase : examLightBase, options);

export const getClassActivityInclude = (options?: RelationOptions<Prisma.ClassActivityInclude>, useFull = false) =>
  mergeInclude(useFull ? classActivityFullBase : classActivityLightBase, options);

export const getInvoiceInclude = (options?: RelationOptions<Prisma.InvoiceInclude>, useFull = false) =>
  mergeInclude(useFull ? invoiceFullBase : invoiceLightBase, options);

export const getPaymentInclude = (options?: RelationOptions<Prisma.PaymentInclude>, useFull = false) =>
  mergeInclude(useFull ? paymentFullBase : paymentLightBase, options);

export const getRolePermissionInclude = (options?: RelationOptions<Prisma.RolePermissionInclude>, useFull = false) =>
  mergeInclude(useFull ? rolePermissionFullBase : rolePermissionLightBase, options);

export const getAssetInclude = (options?: RelationOptions<Prisma.AssetInclude>, useFull = false) =>
  mergeInclude(useFull ? assetFullBase : assetLightBase, options);

export const getAssetLogInclude = (options?: RelationOptions<Prisma.AssetLogInclude>, useFull = false) =>
  mergeInclude(useFull ? assetLogFullBase : assetLogLightBase, options);

export const getVisitorLogInclude = (options?: RelationOptions<Prisma.VisitorLogInclude>, useFull = false) =>
  mergeInclude(useFull ? visitorLogFullBase : visitorLogLightBase, options);

export const getSchoolEventInclude = (options?: RelationOptions<Prisma.SchoolEventInclude>, useFull = false) =>
  mergeInclude(useFull ? schoolEventFullBase : schoolEventLightBase, options);

export const getTimetableInclude = (options?: RelationOptions<Prisma.TimetableInclude>, useFull = false) =>
  mergeInclude(useFull ? timetableFullBase : timetableLightBase, options);

export const getLibraryLogInclude = (options?: RelationOptions<Prisma.LibraryLogInclude>, useFull = false) =>
  mergeInclude(useFull ? libraryLogFullBase : libraryLogLightBase, options);

export const getTransportVehicleInclude = (options?: RelationOptions<Prisma.TransportVehicleInclude>, useFull = false) =>
  mergeInclude(useFull ? transportVehicleFullBase : transportVehicleLightBase, options);

export const getDisciplineLogInclude = (options?: RelationOptions<Prisma.DisciplineLogInclude>, useFull = false) =>
  mergeInclude(useFull ? disciplineLogFullBase : disciplineLogLightBase, options);

export const getAnnouncementInclude = (options?: RelationOptions<Prisma.AnnouncementInclude>, useFull = false) =>
  mergeInclude(useFull ? announcementFullBase : announcementLightBase, options);

export const getPromotionInclude = (options?: RelationOptions<Prisma.PromotionInclude>, useFull = false) =>
  mergeInclude(useFull ? promotionFullBase : promotionLightBase, options);
