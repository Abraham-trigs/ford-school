import { PrismaClient, Role, FinanceType, FinanceCategory, FinanceStatus, TransactionDirection, PaymentMethod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with finance-related data...");

  // 1️⃣ Create a school session
  const schoolSession = await prisma.schoolSession.create({
    data: {
      name: "Springfield High Session 2025",
      domain: "springfield.edu",
    },
  });

  // 2️⃣ Create a school linked to the session
  const school = await prisma.school.create({
    data: {
      name: "Springfield High School",
      address: "742 Evergreen Terrace",
    },
  });

  // 3️⃣ Create a user (Finance Officer)
  const financeUser = await prisma.userSession.create({
    data: {
      email: "finance@springfield.edu",
      passwordHash: "hashedpassword123", // ⚠️ Replace in production with bcrypt hash
      role: Role.FINANCE,
      schoolId: schoolSession.id,
    },
  });

  // 4️⃣ Create a teacher and student for context
  await prisma.teacher.create({
    data: {
      firstName: "Edna",
      lastName: "Krabappel",
      email: "edna.krabappel@springfield.edu",
      subjects: ["Math", "Science"],
      classes: ["Class A"],
      schoolId: school.id,
    },
  });

  await prisma.student.create({
    data: {
      firstName: "Bart",
      lastName: "Simpson",
      class: "Class A",
      age: 10,
      parentName: "Homer Simpson",
      schoolId: school.id,
    },
  });

  // 5️⃣ Create Finance Records
  const tuitionIncome = await prisma.financeRecord.create({
    data: {
      schoolId: school.id,
      createdById: financeUser.id,
      type: FinanceType.INCOME,
      category: FinanceCategory.TUITION,
      amount: new Decimal(5000),
      description: "Tuition payments for Q1",
      status: FinanceStatus.APPROVED,
      date: new Date("2025-01-15"),
    },
  });

  const salaryExpense = await prisma.financeRecord.create({
    data: {
      schoolId: school.id,
      createdById: financeUser.id,
      type: FinanceType.EXPENSE,
      category: FinanceCategory.SALARY,
      amount: new Decimal(3000),
      description: "Teacher salaries for January",
      status: FinanceStatus.APPROVED,
      date: new Date("2025-01-31"),
    },
  });

  // 6️⃣ Finance Transactions
  await prisma.financeTransaction.createMany({
    data: [
      {
        recordId: tuitionIncome.id,
        amount: new Decimal(5000),
        direction: TransactionDirection.INFLOW,
        method: PaymentMethod.BANK_TRANSFER,
        reference: "TXN-TUITION-001",
      },
      {
        recordId: salaryExpense.id,
        amount: new Decimal(3000),
        direction: TransactionDirection.OUTFLOW,
        method: PaymentMethod.BANK_TRANSFER,
        reference: "TXN-SALARY-001",
      },
    ],
  });

  // 7️⃣ Finance Budgets
  await prisma.financeBudget.createMany({
    data: [
      {
        schoolId: school.id,
        year: 2025,
        category: FinanceCategory.TUITION,
        allocated: new Decimal(20000),
        spent: new Decimal(5000),
        remaining: new Decimal(15000),
      },
      {
        schoolId: school.id,
        year: 2025,
        category: FinanceCategory.SALARY,
        allocated: new Decimal(15000),
        spent: new Decimal(3000),
        remaining: new Decimal(12000),
      },
    ],
  });

  // 8️⃣ Cache entry (mock AI insight)
  await prisma.financeInsightCache.create({
    data: {
      schoolId: school.id,
      data: {
        summary: "School finances are stable with positive cash flow.",
        trends: ["Tuition payments increased by 10%", "Staff costs stable"],
        recommendations: ["Consider increasing savings", "Automate payroll"],
      },
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600 * 1000),
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
