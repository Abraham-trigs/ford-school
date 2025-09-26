-- CreateEnum
CREATE TYPE "public"."AttendanceSessionType" AS ENUM ('STUDENT_CLASS', 'STAFF_WORK');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'TERM', 'YEARLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD', 'CHEQUE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReceiptType" AS ENUM ('FULL_PAYMENT', 'PART_PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."ReceiptStatus" AS ENUM ('ISSUED', 'REPRINTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ExamType" AS ENUM ('MIDTERM', 'ENDTERM', 'MOCK', 'FINAL', 'WAEC', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PromotionDecision" AS ENUM ('PROMOTED', 'REPEATED', 'WITHHELD');

-- CreateEnum
CREATE TYPE "public"."AssetCategory" AS ENUM ('CLASSROOM', 'LAB', 'LIBRARY', 'KITCHEN', 'OFFICE', 'TRANSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AssetCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "public"."AssetAction" AS ENUM ('ADDED', 'REMOVED', 'MAINTENANCE', 'TRANSFER', 'DISPOSED');

-- CreateEnum
CREATE TYPE "public"."VisitorStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('HOLIDAY', 'EXAM', 'ASSEMBLY', 'CELEBRATION', 'MEETING', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LibraryAction" AS ENUM ('BORROWED', 'RETURNED', 'LOST', 'DAMAGED', 'ADDED');

-- CreateEnum
CREATE TYPE "public"."DisciplineType" AS ENUM ('WARNING', 'SUSPENSION', 'EXPULSION', 'NOTE');

-- CreateEnum
CREATE TYPE "public"."ClassActivityType" AS ENUM ('CLASSWORK', 'HOMEWORK', 'EXTRA_CLASS', 'EXAM');

-- CreateTable
CREATE TABLE "public"."SessionData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "device" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "pagesVisited" JSONB,
    "clicks" JSONB,
    "keyboardInputs" JSONB,
    "bookmarks" JSONB,
    "externalPagesVisited" JSONB,
    "localStorageData" JSONB,
    "sessionStorageData" JSONB,
    "cookiesData" JSONB,
    "mouseMovements" JSONB,
    "scrollPositions" JSONB,
    "activeTime" INTEGER,

    CONSTRAINT "SessionData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionUpdate" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateReason" TEXT NOT NULL,

    CONSTRAINT "SessionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoleModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "profilePic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT,
    "departmentId" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceSession" (
    "id" TEXT NOT NULL,
    "type" "public"."AttendanceSessionType" NOT NULL,
    "teacherId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "examType" "public"."ExamType" NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassActivity" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "type" "public"."ClassActivityType" NOT NULL,
    "examId" TEXT,
    "score" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "userId" TEXT NOT NULL,
    "issuedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Receipt" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "type" "public"."ReceiptType" NOT NULL,
    "status" "public"."ReceiptStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffSalary" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payPeriod" "public"."PaymentType" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "public"."PaymentMethod" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolExpense" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidById" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolIncome" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receivedFrom" TEXT,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "recordedById" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."AssetCategory" NOT NULL,
    "condition" "public"."AssetCondition" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssetLog" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "action" "public"."AssetAction" NOT NULL,
    "notes" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisitorLog" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOut" TIMESTAMP(3),
    "purpose" TEXT NOT NULL,
    "visitedUserId" TEXT,
    "status" "public"."VisitorStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,

    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "public"."EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "SchoolEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Timetable" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "day" TEXT NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LibraryLog" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "public"."LibraryAction" NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "LibraryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportVehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "driverId" TEXT,
    "acquiredAt" TIMESTAMP(3),
    "condition" "public"."AssetCondition" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DisciplineLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "issuedById" TEXT NOT NULL,
    "type" "public"."DisciplineType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Promotion" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "term" INTEGER,
    "decision" "public"."PromotionDecision" NOT NULL,
    "decidedById" TEXT NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "actions" TEXT[],
    "groupType" TEXT,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolePermissionResource" (
    "id" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,

    CONSTRAINT "RolePermissionResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolePermissionRecord" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,

    CONSTRAINT "RolePermissionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RoleRelations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleRelations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_UserParents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserParents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_UserParentOf" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserParentOf_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_DepartmentStaff" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartmentStaff_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EventParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionData_sessionKey_key" ON "public"."SessionData"("sessionKey");

-- CreateIndex
CREATE INDEX "SessionData_userId_idx" ON "public"."SessionData"("userId");

-- CreateIndex
CREATE INDEX "SessionData_sessionKey_idx" ON "public"."SessionData"("sessionKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatus_name_key" ON "public"."UserStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleModel_name_key" ON "public"."RoleModel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "public"."User"("roleId");

-- CreateIndex
CREATE INDEX "User_statusId_idx" ON "public"."User"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "public"."Staff"("userId");

-- CreateIndex
CREATE INDEX "Staff_userId_idx" ON "public"."Staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE INDEX "Student_sectionId_idx" ON "public"."Student"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNo_sectionId_key" ON "public"."Student"("rollNo", "sectionId");

-- CreateIndex
CREATE INDEX "Section_teacherId_idx" ON "public"."Section"("teacherId");

-- CreateIndex
CREATE INDEX "Section_departmentId_idx" ON "public"."Section"("departmentId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_userId_idx" ON "public"."AttendanceRecord"("userId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_sessionId_idx" ON "public"."AttendanceRecord"("sessionId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_status_idx" ON "public"."AttendanceRecord"("status");

-- CreateIndex
CREATE INDEX "AttendanceSession_teacherId_idx" ON "public"."AttendanceSession"("teacherId");

-- CreateIndex
CREATE INDEX "AttendanceSession_sectionId_idx" ON "public"."AttendanceSession"("sectionId");

-- CreateIndex
CREATE INDEX "AttendanceSession_type_idx" ON "public"."AttendanceSession"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "public"."Subject"("code");

-- CreateIndex
CREATE INDEX "Exam_sectionId_idx" ON "public"."Exam"("sectionId");

-- CreateIndex
CREATE INDEX "Exam_examType_idx" ON "public"."Exam"("examType");

-- CreateIndex
CREATE INDEX "ClassActivity_studentId_idx" ON "public"."ClassActivity"("studentId");

-- CreateIndex
CREATE INDEX "ClassActivity_subjectId_idx" ON "public"."ClassActivity"("subjectId");

-- CreateIndex
CREATE INDEX "ClassActivity_teacherId_idx" ON "public"."ClassActivity"("teacherId");

-- CreateIndex
CREATE INDEX "ClassActivity_type_idx" ON "public"."ClassActivity"("type");

-- CreateIndex
CREATE INDEX "ClassActivity_examId_idx" ON "public"."ClassActivity"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassActivity_studentId_subjectId_type_createdAt_key" ON "public"."ClassActivity"("studentId", "subjectId", "type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionRef_key" ON "public"."Payment"("transactionRef");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "public"."Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_issuedById_idx" ON "public"."Payment"("issuedById");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "public"."Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "Receipt_invoiceId_idx" ON "public"."Receipt"("invoiceId");

-- CreateIndex
CREATE INDEX "Receipt_status_idx" ON "public"."Receipt"("status");

-- CreateIndex
CREATE INDEX "StaffSalary_staffId_idx" ON "public"."StaffSalary"("staffId");

-- CreateIndex
CREATE INDEX "StaffSalary_status_idx" ON "public"."StaffSalary"("status");

-- CreateIndex
CREATE INDEX "SchoolExpense_paidById_idx" ON "public"."SchoolExpense"("paidById");

-- CreateIndex
CREATE INDEX "SchoolIncome_recordedById_idx" ON "public"."SchoolIncome"("recordedById");

-- CreateIndex
CREATE INDEX "Department_ownerId_idx" ON "public"."Department"("ownerId");

-- CreateIndex
CREATE INDEX "AssetLog_assetId_idx" ON "public"."AssetLog"("assetId");

-- CreateIndex
CREATE INDEX "AssetLog_performedById_idx" ON "public"."AssetLog"("performedById");

-- CreateIndex
CREATE INDEX "VisitorLog_visitedUserId_idx" ON "public"."VisitorLog"("visitedUserId");

-- CreateIndex
CREATE INDEX "VisitorLog_createdById_idx" ON "public"."VisitorLog"("createdById");

-- CreateIndex
CREATE INDEX "VisitorLog_approvedById_idx" ON "public"."VisitorLog"("approvedById");

-- CreateIndex
CREATE INDEX "VisitorLog_status_idx" ON "public"."VisitorLog"("status");

-- CreateIndex
CREATE INDEX "SchoolEvent_createdById_idx" ON "public"."SchoolEvent"("createdById");

-- CreateIndex
CREATE INDEX "SchoolEvent_eventType_idx" ON "public"."SchoolEvent"("eventType");

-- CreateIndex
CREATE INDEX "Timetable_sectionId_idx" ON "public"."Timetable"("sectionId");

-- CreateIndex
CREATE INDEX "Timetable_teacherId_idx" ON "public"."Timetable"("teacherId");

-- CreateIndex
CREATE INDEX "Timetable_subjectId_idx" ON "public"."Timetable"("subjectId");

-- CreateIndex
CREATE INDEX "LibraryLog_bookId_idx" ON "public"."LibraryLog"("bookId");

-- CreateIndex
CREATE INDEX "LibraryLog_userId_idx" ON "public"."LibraryLog"("userId");

-- CreateIndex
CREATE INDEX "LibraryLog_action_idx" ON "public"."LibraryLog"("action");

-- CreateIndex
CREATE INDEX "TransportVehicle_driverId_idx" ON "public"."TransportVehicle"("driverId");

-- CreateIndex
CREATE INDEX "DisciplineLog_studentId_idx" ON "public"."DisciplineLog"("studentId");

-- CreateIndex
CREATE INDEX "DisciplineLog_issuedById_idx" ON "public"."DisciplineLog"("issuedById");

-- CreateIndex
CREATE INDEX "DisciplineLog_type_idx" ON "public"."DisciplineLog"("type");

-- CreateIndex
CREATE INDEX "Announcement_createdById_idx" ON "public"."Announcement"("createdById");

-- CreateIndex
CREATE INDEX "Promotion_studentId_idx" ON "public"."Promotion"("studentId");

-- CreateIndex
CREATE INDEX "Promotion_decidedById_idx" ON "public"."Promotion"("decidedById");

-- CreateIndex
CREATE INDEX "Promotion_decision_idx" ON "public"."Promotion"("decision");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "public"."RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_groupType_groupId_idx" ON "public"."RolePermission"("groupType", "groupId");

-- CreateIndex
CREATE INDEX "RolePermissionResource_permissionId_idx" ON "public"."RolePermissionResource"("permissionId");

-- CreateIndex
CREATE INDEX "RolePermissionResource_resourceName_idx" ON "public"."RolePermissionResource"("resourceName");

-- CreateIndex
CREATE INDEX "RolePermissionRecord_resourceId_recordId_idx" ON "public"."RolePermissionRecord"("resourceId", "recordId");

-- CreateIndex
CREATE INDEX "_RoleRelations_B_index" ON "public"."_RoleRelations"("B");

-- CreateIndex
CREATE INDEX "_UserParents_B_index" ON "public"."_UserParents"("B");

-- CreateIndex
CREATE INDEX "_UserParentOf_B_index" ON "public"."_UserParentOf"("B");

-- CreateIndex
CREATE INDEX "_DepartmentStaff_B_index" ON "public"."_DepartmentStaff"("B");

-- CreateIndex
CREATE INDEX "_EventParticipants_B_index" ON "public"."_EventParticipants"("B");

-- AddForeignKey
ALTER TABLE "public"."SessionData" ADD CONSTRAINT "SessionData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionUpdate" ADD CONSTRAINT "SessionUpdate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."SessionData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."RoleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."UserStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AttendanceSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceSession" ADD CONSTRAINT "AttendanceSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceSession" ADD CONSTRAINT "AttendanceSession_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassActivity" ADD CONSTRAINT "ClassActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassActivity" ADD CONSTRAINT "ClassActivity_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassActivity" ADD CONSTRAINT "ClassActivity_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassActivity" ADD CONSTRAINT "ClassActivity_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Receipt" ADD CONSTRAINT "Receipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffSalary" ADD CONSTRAINT "StaffSalary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolExpense" ADD CONSTRAINT "SchoolExpense_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolIncome" ADD CONSTRAINT "SchoolIncome_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssetLog" ADD CONSTRAINT "AssetLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitorLog" ADD CONSTRAINT "VisitorLog_visitedUserId_fkey" FOREIGN KEY ("visitedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitorLog" ADD CONSTRAINT "VisitorLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitorLog" ADD CONSTRAINT "VisitorLog_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolEvent" ADD CONSTRAINT "SchoolEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryLog" ADD CONSTRAINT "LibraryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportVehicle" ADD CONSTRAINT "TransportVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DisciplineLog" ADD CONSTRAINT "DisciplineLog_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Promotion" ADD CONSTRAINT "Promotion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Promotion" ADD CONSTRAINT "Promotion_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."RoleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermissionResource" ADD CONSTRAINT "RolePermissionResource_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."RolePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermissionRecord" ADD CONSTRAINT "RolePermissionRecord_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."RolePermissionResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleRelations" ADD CONSTRAINT "_RoleRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."RoleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleRelations" ADD CONSTRAINT "_RoleRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."RoleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserParents" ADD CONSTRAINT "_UserParents_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserParents" ADD CONSTRAINT "_UserParents_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserParentOf" ADD CONSTRAINT "_UserParentOf_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserParentOf" ADD CONSTRAINT "_UserParentOf_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DepartmentStaff" ADD CONSTRAINT "_DepartmentStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DepartmentStaff" ADD CONSTRAINT "_DepartmentStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventParticipants" ADD CONSTRAINT "_EventParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."SchoolEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventParticipants" ADD CONSTRAINT "_EventParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
