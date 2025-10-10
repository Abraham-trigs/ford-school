// src/app/(dashboard)/finance/page.tsx
import { prisma } from "../../../lib/prisma";
import FinanceDashboard from "@/components/Finance/FinanceDashbaord"; // client component
import { getUserFromCookie } from "@/lib/auth/cookies";

export default async function FinancePage() {
  const user = await getUserFromCookie();
  if (!user) return <div className="p-6 text-red-500">Unauthorized</div>;

  // Fetch finance data server-side
  const records = await prisma.financeRecord.findMany({
    where: { schoolId: user.schoolId },
    orderBy: { date: "desc" },
  });

  // Compute analytics summary
  const summary = records.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + r.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const income = summary["INCOME"] || 0;
  const expense = summary["EXPENSE"] || 0;
  const salary = summary["SALARY"] || 0;
  const purchase = summary["PURCHASE"] || 0;
  const other = summary["OTHER"] || 0;

  const net = income - (expense + salary + purchase + other);

  return (
    <div className="space-y-6 p-6">
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard label="Income" value={income} color="text-green-500" />
        <SummaryCard label="Expense" value={expense} color="text-red-500" />
        <SummaryCard label="Salary" value={salary} color="text-blue-500" />
        <SummaryCard
          label="Purchase"
          value={purchase}
          color="text-purple-500"
        />
        <SummaryCard label="Other" value={other} color="text-gray-500" />
      </section>

      <div className="text-lg font-semibold">
        Net Total:{" "}
        <span className={net >= 0 ? "text-green-400" : "text-red-400"}>
          ₵{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <FinanceDashboard initialRecords={records} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-deepest0 rounded-lg shadow p-4">
      <h4 className="text-sm text-gray-400">{label}</h4>
      <p className={`text-xl font-bold ${color}`}>
        ₵{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
