-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('SUPERADMIN', 'ADMIN', 'MODERATOR', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'ASSISTANT_TEACHER', 'COUNSELOR', 'LIBRARIAN', 'EXAM_OFFICER', 'FINANCE', 'HR', 'RECEPTIONIST', 'IT_SUPPORT', 'TRANSPORT', 'NURSE', 'COOK', 'CLEANER', 'SECURITY', 'MAINTENANCE', 'STUDENT', 'CLASS_REP', 'PARENT', 'ALUMNI', 'AUDITOR', 'INSPECTOR', 'GUEST');

-- CreateEnum
CREATE TYPE "public"."GradeLevel" AS ENUM ('PRE_K', 'KINDERGARTEN', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12', 'SPECIAL_ED', 'ADULT_ED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('ACTIVE', 'WITHDRAWN', 'FROZEN', 'ALUMNI');

-- CreateEnum
CREATE TYPE "public"."GraduationOutcome" AS ENUM ('PROMOTED', 'REPEATED', 'HELD', 'ALUMNI');

-- CreateEnum
CREATE TYPE "public"."GraduationScope" AS ENUM ('GRADE', 'CLASS');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT', 'CLASSWORK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('FEE_PAYMENT', 'RESOURCE_PURCHASE', 'REFUND', 'ADJUSTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('BUS', 'VAN', 'MINIBUS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ResourceCategory" AS ENUM ('STATIONERY', 'BOOK', 'UNIFORM', 'ELECTRONICS', 'SERVICE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."SuperAdmin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolSession" (
    "id" SERIAL NOT NULL,
    "superAdminId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SchoolSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "profilePicture" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "department" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSchoolSession" (
    "id" SERIAL NOT NULL,
    "humanId" TEXT NOT NULL,
    "schoolSessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."RoleType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserSchoolSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "admissionNumber" TEXT,
    "admissionDate" TIMESTAMP(3),
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "currentGrade" "public"."GradeLevel" NOT NULL,
    "status" "public"."StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "classroomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "specialization" TEXT,
    "qualification" TEXT,
    "profilePicture" TEXT,
    "department" TEXT,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParentProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "occupation" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "profilePicture" TEXT,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "profilePicture" TEXT,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParentStudent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentProfileId" INTEGER NOT NULL,
    "parentUserId" INTEGER NOT NULL,
    "relationType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gradeLevel" "public"."GradeLevel" NOT NULL,
    "schoolSessionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GraduationBatch" (
    "id" TEXT NOT NULL,
    "scope" "public"."GraduationScope" NOT NULL,
    "gradeLevel" "public"."GradeLevel" NOT NULL,
    "classroomId" TEXT,
    "year" INTEGER NOT NULL,
    "processedById" INTEGER NOT NULL,
    "processedByRole" "public"."RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GraduationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GraduationRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fromGrade" "public"."GradeLevel" NOT NULL,
    "toGrade" "public"."GradeLevel",
    "outcome" "public"."GraduationOutcome" NOT NULL DEFAULT 'PROMOTED',
    "processedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "schoolSessionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "teacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."AssignmentType" NOT NULL DEFAULT 'HOMEWORK',
    "teacherId" INTEGER,
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Grade" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "assignmentId" INTEGER,
    "value" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION,
    "letter" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transportation" (
    "id" SERIAL NOT NULL,
    "schoolSessionId" INTEGER NOT NULL,
    "routeName" TEXT NOT NULL,
    "vehicleType" "public"."VehicleType" NOT NULL,
    "vehicleNumber" TEXT,
    "driverName" TEXT,
    "capacity" INTEGER NOT NULL,
    "departureTime" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "stops" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Transportation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportStop" (
    "id" SERIAL NOT NULL,
    "transportationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "eta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resource" (
    "id" SERIAL NOT NULL,
    "schoolSessionId" INTEGER NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."ResourceCategory" NOT NULL DEFAULT 'OTHER',
    "price" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Purchase" (
    "id" SERIAL NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "buyerId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinancialTransaction" (
    "id" SERIAL NOT NULL,
    "schoolSessionId" INTEGER NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "reference" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER,
    "purchaseId" INTEGER,
    "userId" INTEGER,
    "gateway" TEXT,
    "gatewayRef" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHC',
    "status" "public"."PaymentStatus" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CourseStudents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CourseStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AssignmentStudents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignmentStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "public"."SuperAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSession_slug_key" ON "public"."SchoolSession"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSchoolSession_humanId_key" ON "public"."UserSchoolSession"("humanId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSchoolSession_schoolSessionId_email_key" ON "public"."UserSchoolSession"("schoolSessionId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSchoolSession_schoolSessionId_userId_key" ON "public"."UserSchoolSession"("schoolSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "public"."StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_admissionNumber_key" ON "public"."StudentProfile"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "public"."TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_employeeId_key" ON "public"."TeacherProfile"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "public"."ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "public"."StaffProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_employeeId_key" ON "public"."StaffProfile"("employeeId");

-- CreateIndex
CREATE INDEX "ParentStudent_studentId_idx" ON "public"."ParentStudent"("studentId");

-- CreateIndex
CREATE INDEX "ParentStudent_parentUserId_idx" ON "public"."ParentStudent"("parentUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_schoolSessionId_name_key" ON "public"."Classroom"("schoolSessionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_sku_key" ON "public"."Resource"("sku");

-- CreateIndex
CREATE INDEX "_CourseStudents_B_index" ON "public"."_CourseStudents"("B");

-- CreateIndex
CREATE INDEX "_AssignmentStudents_B_index" ON "public"."_AssignmentStudents"("B");

-- AddForeignKey
ALTER TABLE "public"."SchoolSession" ADD CONSTRAINT "SchoolSession_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "public"."SuperAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSchoolSession" ADD CONSTRAINT "UserSchoolSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSchoolSession" ADD CONSTRAINT "UserSchoolSession_schoolSessionId_fkey" FOREIGN KEY ("schoolSessionId") REFERENCES "public"."SchoolSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentStudent" ADD CONSTRAINT "ParentStudent_parentProfileId_fkey" FOREIGN KEY ("parentProfileId") REFERENCES "public"."ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentStudent" ADD CONSTRAINT "ParentStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentStudent" ADD CONSTRAINT "ParentStudent_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Classroom" ADD CONSTRAINT "Classroom_schoolSessionId_fkey" FOREIGN KEY ("schoolSessionId") REFERENCES "public"."SchoolSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GraduationBatch" ADD CONSTRAINT "GraduationBatch_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GraduationBatch" ADD CONSTRAINT "GraduationBatch_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GraduationRecord" ADD CONSTRAINT "GraduationRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GraduationRecord" ADD CONSTRAINT "GraduationRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."GraduationBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GraduationRecord" ADD CONSTRAINT "GraduationRecord_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_schoolSessionId_fkey" FOREIGN KEY ("schoolSessionId") REFERENCES "public"."SchoolSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transportation" ADD CONSTRAINT "Transportation_schoolSessionId_fkey" FOREIGN KEY ("schoolSessionId") REFERENCES "public"."SchoolSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportStop" ADD CONSTRAINT "TransportStop_transportationId_fkey" FOREIGN KEY ("transportationId") REFERENCES "public"."Transportation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource" ADD CONSTRAINT "Resource_schoolSessionId_fkey" FOREIGN KEY ("schoolSessionId") REFERENCES "public"."SchoolSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_schoolSessionId_fkey" FOREIGN KEY ("schoolSessionId") REFERENCES "public"."SchoolSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FinancialTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseStudents" ADD CONSTRAINT "_CourseStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseStudents" ADD CONSTRAINT "_CourseStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignmentStudents" ADD CONSTRAINT "_AssignmentStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignmentStudents" ADD CONSTRAINT "_AssignmentStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
