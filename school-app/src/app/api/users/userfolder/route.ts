// File: /app/api/users/UserFolder/route.ts
// This API route fetches users grouped by their role and maps them into "UserCards".
// Each role defined in the ROLES array is queried separately, ensuring only relevant users
// are returned per role, while preserving all relevant relational data.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Role, UserStatus } from "@/types/school";

// ------------------ UserCard Interface ------------------
interface UserCard {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  profilePic?: string;

  staff?: {
    id: string;
    position: string;
    salaries?: { id: string; amount: number; payPeriod: string; status: string; method: string }[];
    departments?: { id: string; name: string }[];
  };

  student?: {
    id: string;
    sectionId: string;
    rollNo: string;
    parents?: { id: string; name: string }[];
    promotions?: { id?: number; term?: number; decision: string; decidedById: string }[];
  };

  parentOf?: { id: string; name: string }[];

  payments?: { id: string; amount: number; paymentType: string; method: string; status: string }[];
  issuedPayments?: { id: string; amount: number; paymentType: string; method: string; status: string }[];

  invoices?: { id: string; amount: number; status: string }[];
  attendanceRecords?: { id: string; status: string; date: string }[];

  createdEvents?: { id: string; title: string; startDate: string; endDate: string }[];
  events?: { id: string; title: string; startDate: string; endDate: string }[];

  borrowedBooks?: { id: string; bookId: string; action: string; borrowedAt: string; returnedAt?: string }[];
  drivingVehicles?: { id: string; name: string; capacity: number; condition: string }[];
  issuedDisciplineLogs?: { id: string; studentId?: string; type: string; notes?: string }[];
  createdAnnouncements?: { id: string; content: string }[];

  createdVisitorLogs?: { id: string; visitorName: string; status: string }[];
  visitedVisitorLogs?: { id: string; visitorName: string; status: string }[];
  approvedVisitorLogs?: { id: string; visitorName: string; status: string }[];

  subjectAssignments?: { id: string; subject: string }[];
  attendanceSessionsTaken?: { id: string; type: string; sectionId: string }[];
  promotionsDecided?: { id: string; studentId: string; decision: string }[];
  schoolExpensesPaid?: { id: string; purpose: string; amount: number }[];
  schoolIncomesRecorded?: { id: string; description: string; amount: number }[];
  departments?: { id: string; name: string }[];
  sectionsTaught?: { id: string; name: string }[];
  performedAssetLogs?: { id: string; assetId: string; action: string; notes?: string }[];
}

// ------------------ UserFolder Interface ------------------
interface UserFolder {
  [role: string]: UserCard[];
}

// ------------------ Roles List ------------------
const ROLES: Role[] = [
  "TEACHER",
  "SECRETARY",
  "ACCOUNTANT",
  "LIBRARIAN",
  "COUNSELOR",
  "NURSE",
  "CLEANER",
  "JANITOR",
  "COOK",
  "KITCHEN_ASSISTANT",
  "STUDENT",
  "PARENT",
  "ADMIN",
  "SUPERADMIN",
];

// ------------------ GET Handler ------------------
export async function GET(req: NextRequest) {
  try {
    const folder: UserFolder = {};

    for (const role of ROLES) {
      // Fetch users for this role
      const users = await prisma.user.findMany({
        where: { role },
        include: {
          staff: { include: { salaries: true, departments: true } },
          student: { include: { parents: true, promotions: true } },
          parentOf: true,
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
          subjectAssignments: true,
          attendanceSessionsTaken: true,
          promotionsDecided: true,
          schoolExpensesPaid: true,
          schoolIncomesRecorded: true,
          departments: true,
          sectionsTaught: true,
          performedAssetLogs: true,
        },
      });

      // Map each user to a UserCard individually
      folder[role] = users.map((user) => {
        const card: UserCard = {
          id: user.id, // set user ID
          name: user.name, // set name
          email: user.email ?? undefined, // set email if exists
          phone: user.phone ?? undefined, // set phone if exists
          role: user.role, // set role
          status: user.status, // set status
          profilePic: user.profilePic ?? undefined, // set profile picture
        };

        // ------------------ Staff Data ------------------
        if (user.staff) {
          card.staff = {
            id: user.staff.id, // staff ID
            position: user.staff.position, // staff position
            salaries: user.staff.salaries?.map((s) => ({
              id: s.id,
              amount: s.amount,
              payPeriod: s.payPeriod,
              status: s.status,
              method: s.method,
            })),
            departments: user.staff.departments?.map((d) => ({ id: d.id, name: d.name })),
          };
        }

        // ------------------ Student Data ------------------
        if (user.student) {
          card.student = {
            id: user.student.id,
            sectionId: user.student.sectionId,
            rollNo: user.student.rollNo,
            parents: user.student.parents?.map((p) => ({ id: p.id, name: p.name })),
            promotions: user.student.promotions?.map((p) => ({
              id: p.id,
              term: p.term ?? undefined,
              decision: p.decision,
              decidedById: p.decidedById,
            })),
          };
        }

        // ------------------ Parent Data ------------------
        if (user.parentOf?.length) {
          card.parentOf = user.parentOf.map((p) => ({ id: p.id, name: p.name }));
        }

        // ------------------ Payments ------------------
        card.payments = user.payments?.map((p) => ({
          id: p.id,
          amount: p.amount,
          paymentType: p.paymentType,
          method: p.method,
          status: p.status,
        }));

        card.issuedPayments = user.issuedPayments?.map((p) => ({
          id: p.id,
          amount: p.amount,
          paymentType: p.paymentType,
          method: p.method,
          status: p.status,
        }));

        // ------------------ Invoices ------------------
        card.invoices = user.invoices?.map((i) => ({
          id: i.id,
          amount: i.amount,
          status: i.status,
        }));

        // ------------------ Attendance ------------------
        card.attendanceRecords = user.attendanceRecords?.map((a) => ({
          id: a.id,
          status: a.status,
          date: a.date.toISOString(),
        }));

        // ------------------ Events ------------------
        card.createdEvents = user.createdEvents?.map((e) => ({
          id: e.id,
          title: e.title,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate.toISOString(),
        }));

        card.events = user.events?.map((e) => ({
          id: e.id,
          title: e.title,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate.toISOString(),
        }));

        // ------------------ Borrowed Books ------------------
        card.borrowedBooks = user.borrowedBooks?.map((b) => ({
          id: b.id,
          bookId: b.bookId,
          action: b.action,
          borrowedAt: b.borrowedAt.toISOString(),
          returnedAt: b.returnedAt?.toISOString(),
        }));

        // ------------------ Driving Vehicles ------------------
        card.drivingVehicles = user.drivingVehicles?.map((v) => ({
          id: v.id,
          name: v.name,
          capacity: v.capacity,
          condition: v.condition,
        }));

        // ------------------ Discipline Logs ------------------
        card.issuedDisciplineLogs = user.issuedDisciplineLogs?.map((d) => ({
          id: d.id,
          studentId: d.studentId ?? undefined,
          type: d.type,
          notes: d.notes ?? undefined,
        }));

        // ------------------ Announcements ------------------
        card.createdAnnouncements = user.createdAnnouncements?.map((a) => ({
          id: a.id,
          content: a.content,
        }));

        // ------------------ Visitor Logs ------------------
        card.createdVisitorLogs = user.createdVisitorLogs?.map((v) => ({
          id: v.id,
          visitorName: v.visitorName,
          status: v.status,
        }));

        card.visitedVisitorLogs = user.visitedVisitorLogs?.map((v) => ({
          id: v.id,
          visitorName: v.visitorName,
          status: v.status,
        }));

        card.approvedVisitorLogs = user.approvedVisitorLogs?.map((v) => ({
          id: v.id,
          visitorName: v.visitorName,
          status: v.status,
        }));

        // ------------------ Subject Assignments ------------------
        card.subjectAssignments = user.subjectAssignments?.map((s) => ({
          id: s.id,
          subject: s.subject,
        }));

        // ------------------ Attendance Sessions Taken ------------------
        card.attendanceSessionsTaken = user.attendanceSessionsTaken?.map((s) => ({
          id: s.id,
          type: s.type,
          sectionId: s.sectionId,
        }));

        // ------------------ Promotions Decided ------------------
        card.promotionsDecided = user.promotionsDecided?.map((p) => ({
          id: p.id,
          studentId: p.studentId,
          decision: p.decision,
        }));

        // ------------------ School Expenses & Income ------------------
        card.schoolExpensesPaid = user.schoolExpensesPaid?.map((e) => ({
          id: e.id,
          purpose: e.purpose,
          amount: e.amount,
        }));

        card.schoolIncomesRecorded = user.schoolIncomesRecorded?.map((i) => ({
          id: i.id,
          description: i.description,
          amount: i.amount,
        }));

        // ------------------ Departments & Sections Taught ------------------
        card.departments = user.departments?.map((d) => ({ id: d.id, name: d.name }));
        card.sectionsTaught = user.sectionsTaught?.map((s) => ({ id: s.id, name: s.name }));

        // ------------------ Performed Asset Logs ------------------
        card.performedAssetLogs = user.performedAssetLogs?.map((a) => ({
          id: a.id,
          assetId: a.assetId,
          action: a.action,
          notes: a.notes ?? undefined,
        }));

        return card; // Return the fully mapped UserCard
      });
    }

    // Return the complete UserFolder
    return NextResponse.json({ success: true, folder });
  } catch (err) {
    console.error("Error fetching UserFolder:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch users" });
  }
}
