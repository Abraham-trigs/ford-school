// -------------------- ENUMS --------------------
export enum Role {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  SECRETARY = "SECRETARY",
  ACCOUNTANT = "ACCOUNTANT",
  LIBRARIAN = "LIBRARIAN",
  COUNSELOR = "COUNSELOR",
  NURSE = "NURSE",
  CLEANER = "CLEANER",
  JANITOR = "JANITOR",
  COOK = "COOK",
  KITCHEN_ASSISTANT = "KITCHEN_ASSISTANT",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
}

// User session type for Zustand
export interface UserSession {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// Attendance
export type AttendanceSessionType = "STUDENT_CLASS" | "STAFF_WORK";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

// Payments & Invoices
export type PaymentType = "DAILY" | "WEEKLY" | "MONTHLY" | "TERMLY" | "YEARLY" | "ONE_TIME";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "CHEQUE";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";
export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
export type ReceiptType = "FULL_PAYMENT" | "PART_PAYMENT" | "REFUND";
export type ReceiptStatus = "ISSUED" | "REPRINTED" | "CANCELLED";

// Promotions & Exams
export type PromotionDecision = "PROMOTED" | "REPEATED" | "WITHHELD";
export type ExamType = "MIDTERM" | "ENDTERM" | "MOCK" | "FINAL" | "WAEC" | "OTHER";

// Assets
export type AssetCategory = "CLASSROOM" | "LAB" | "LIBRARY" | "KITCHEN" | "OFFICE" | "TRANSPORT" | "OTHER";
export type AssetCondition = "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";
export type AssetAction = "ADDED" | "REMOVED" | "MAINTENANCE" | "TRANSFER" | "DISPOSED";

// Visitors
export type VisitorStatus = "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

// Events
export type EventType = "HOLIDAY" | "EXAM" | "ASSEMBLY" | "CELEBRATION" | "MEETING" | "OTHER";

// Library
export type LibraryAction = "BORROWED" | "RETURNED" | "LOST" | "DAMAGED" | "ADDED";

// Discipline
export type DisciplineType = "WARNING" | "SUSPENSION" | "EXPULSION" | "NOTE";

// -------------------- MODELS --------------------

// Minimal User for API responses
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  profilePic?: string;
  createdAt: string;
  updatedAt: string;

  student?: Student;
  staff?: Staff;
  parentOf?: Student[];
  parents?: Student[];
}

// Caller type for API route authentication
export interface Caller {
  id: string;
  role: Role;
  children?: { id: string }[];
}

// Staff
export interface Staff {
  id: string;
  userId: string;
  position: string;
}

// Student
export interface Student {
  id: string;
  userId: string;
  sectionId: string;
  rollNo: string;
  parents?: User[];
  parentOf?: User[];
}

// Section
export interface Section {
  id: string;
  name: string;
  teacherId?: string;
  teacher?: User;
}

// Payment
export interface Payment {
  id: string;
  amount: number;
  paymentType: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  userId: string;
  issuedById?: string;
}

// Invoice & Receipt
export interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  userId: string;
  createdAt: string;
  receipts?: Receipt[];
}

export interface Receipt {
  id: string;
  invoiceId?: string;
  type: ReceiptType;
  status: ReceiptStatus;
  issuedAt: string;
}

// Promotion
export interface Promotion {
  id: string;
  studentId: string;
  term?: number;
  decision: PromotionDecision;
  decidedById: string;
}

// Visitor Log
export interface VisitorLog {
  id: string;
  visitorName: string;
  phone?: string;
  email?: string;
  checkIn: string;
  checkOut?: string;
  purpose: string;
  visitedUserId?: string;
  status: VisitorStatus;
  notes?: string;
  createdById: string;
  approvedById?: string;
}

// School Event
export interface SchoolEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdById: string;
  participants?: User[];
}

// Asset & AssetLog
export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: AssetCategory;
  condition: AssetCondition;
  quantity: number;
  location?: string;
}

export interface AssetLog {
  id: string;
  assetId: string;
  action: AssetAction;
  notes?: string;
  performedById: string;
  createdAt: string;
}

// Discipline Log
export interface DisciplineLog {
  id: string;
  studentId?: string;
  issuedById: string;
  type: DisciplineType;
  notes?: string;
  createdAt: string;
}

// Library Log
export interface LibraryLog {
  id: string;
  bookId: string;
  userId: string;
  action: LibraryAction;
  borrowedAt: string;
  returnedAt?: string;
}
