// "use client";

// import { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import { FinanceRecord } from "@/types/finance";

// export default function FinanceTrendChart({
//   records,
// }: {
//   records: FinanceRecord[];
// }) {
//   const [trendData, setTrendData] = useState<
//     { month: string; income: number; expense: number }[]
//   >([]);

//   useEffect(() => {
//     if (!records.length) return;

//     const monthlyTotals: Record<string, { income: number; expense: number }> =
//       {};

//     records.forEach((r) => {
//       const date = new Date(r.date);
//       const month = date.toLocaleString("default", {
//         month: "short",
//         year: "numeric",
//       });

//       const isExpense =
//         r.type.toLowerCase().includes("expense") ||
//         r.type.toLowerCase().includes("debit");
//       const isIncome =
//         r.type.toLowerCase().includes("income") ||
//         r.type.toLowerCase().includes("credit");

//       if (!monthlyTotals[month]) {
//         monthlyTotals[month] = { income: 0, expense: 0 };
//       }

//       if (isIncome) monthlyTotals[month].income += r.amount;
//       else if (isExpense) monthlyTotals[month].expense += r.amount;
//       else monthlyTotals[month].expense += r.amount; // default unknown as expense
//     });

//     const data = Object.entries(monthlyTotals).map(([month, vals]) => ({
//       month,
//       ...vals,
//     }));

//     setTrendData(data);
//   }, [records]);

//   if (!records.length)
//     return (
//       <div className="text-center text-gray-400 italic py-4">
//         No trend data to display
//       </div>
//     );

//   return (
//     <div className="bg-deepest0 rounded-lg p-6 shadow-md mt-6">
//       <h2 className="text-xl font-display text-lightGray mb-4">
//         Monthly Finance Trends
//       </h2>
//       <ResponsiveContainer width="100%" height={320}>
//         <LineChart
//           data={trendData}
//           margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//           <XAxis dataKey="month" stroke="#9ca3af" />
//           <YAxis stroke="#9ca3af" />
//           <Tooltip
//             formatter={(value: number) =>
//               `₵${value.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//               })}`
//             }
//           />
//           <Legend />
//           <Line
//             type="monotone"
//             dataKey="income"
//             stroke="#22c55e"
//             strokeWidth={2}
//           />
//           <Line
//             type="monotone"
//             dataKey="expense"
//             stroke="#ef4444"
//             strokeWidth={2}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { FinanceRecord } from "@/types/finance";
import { format, parseISO } from "date-fns";

export default function FinanceTrendChart({
  records,
}: {
  records: FinanceRecord[];
}) {
  if (!records?.length) {
    return (
      <div className="flex items-center justify-center text-muted italic h-48">
        No trend data available
      </div>
    );
  }

  // Aggregate by month and type
  const monthlyData = records.reduce(
    (acc, r) => {
      const month = format(parseISO(r.date), "MMM yyyy");
      acc[month] = acc[month] || { month, INCOME: 0, EXPENSE: 0 };
      if (r.type === "INCOME") acc[month].INCOME += Number(r.amount);
      if (r.type === "EXPENSE") acc[month].EXPENSE += Number(r.amount);
      return acc;
    },
    {} as Record<string, { month: string; INCOME: number; EXPENSE: number }>
  );

  const data = Object.values(monthlyData).sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  return (
    <motion.div
      className="w-full h-64"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
          <XAxis dataKey="month" tick={{ fill: "#94A3B8" }} />
          <YAxis tick={{ fill: "#94A3B8" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              borderRadius: "8px",
              border: "none",
              color: "#fff",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="INCOME"
            stroke="#22C55E"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="EXPENSE"
            stroke="#E11D48"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
