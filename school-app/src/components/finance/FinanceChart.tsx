// "use client";

// import { useEffect, useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import { FinanceRecord } from "@/types/finance";

// const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#a855f7", "#9ca3af"];

// interface FinanceChartProps {
//   records: FinanceRecord[];
// }

// export default function FinanceChart({ records }: FinanceChartProps) {
//   const [chartData, setChartData] = useState<{ name: string; value: number }[]>(
//     []
//   );

//   useEffect(() => {
//     const totals: Record<string, number> = {};
//     records.forEach((r) => {
//       totals[r.type] = (totals[r.type] || 0) + r.amount;
//     });

//     const data = Object.entries(totals).map(([name, value]) => ({
//       name,
//       value,
//     }));
//     setChartData(data);
//   }, [records]);

//   if (records.length === 0) {
//     return (
//       <div className="text-center text-gray-400 italic py-4">
//         No finance data available for chart
//       </div>
//     );
//   }

//   return (
//     <div className="bg-deepest0 rounded-lg p-6 shadow-md mt-6">
//       <h2 className="text-xl font-display text-lightGray mb-4">
//         Finance Breakdown
//       </h2>
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={chartData}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={({ name, percent }) =>
//               `${name}: ${(percent * 100).toFixed(0)}%`
//             }
//             outerRadius={100}
//             fill="#8884d8"
//             dataKey="value"
//           >
//             {chartData.map((_, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//                 stroke="#1f2937"
//               />
//             ))}
//           </Pie>
//           <Tooltip
//             formatter={(value: number) =>
//               `₵${value.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//               })}`
//             }
//           />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// "use client";

// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
// import { motion } from "framer-motion";
// import { FinanceRecord } from "@/types/finance";

// const COLORS = ["#0EA5E9", "#E11D48", "#22C55E", "#F59E0B", "#8B5CF6"];

// export default function FinanceChart({
//   records,
// }: {
//   records: FinanceRecord[];
// }) {
//   if (!records?.length) {
//     return (
//       <div className="flex items-center justify-center text-muted italic h-48">
//         No finance data available
//       </div>
//     );
//   }

//   // Aggregate totals by type
//   const data = Object.values(
//     records.reduce(
//       (acc, r) => {
//         acc[r.type] = acc[r.type] || { name: r.type, value: 0 };
//         acc[r.type].value += Number(r.amount);
//         return acc;
//       },
//       {} as Record<string, { name: string; value: number }>
//     )
//   );

//   return (
//     <motion.div
//       className="w-full h-64 flex items-center justify-center"
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.4 }}
//     >
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="50%"
//             outerRadius={80}
//             dataKey="value"
//             label={({ name, value }) => `${name}: ${value}`}
//           >
//             {data.map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip
//             formatter={(value: number, name: string) => [`$${value}`, name]}
//             contentStyle={{
//               backgroundColor: "#1E293B",
//               borderRadius: "8px",
//               border: "none",
//               color: "#fff",
//             }}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </motion.div>
//   );
// }

// "use client";

// import { motion } from "framer-motion";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   BarChart,
//   Bar,
// } from "recharts";
// import { useState } from "react";
// import { FinanceRecord } from "@/types/finance";
// import { TrendingUp, BarChart2 } from "lucide-react";

// type Props = {
//   records: FinanceRecord[];
// };

// export default function FinanceChart({ records }: Props) {
//   const [chartType, setChartType] = useState<"LINE" | "BAR">("LINE");

//   // Group data by month
//   const data = Object.values(
//     records.reduce((acc: any, record) => {
//       const month = new Date(record.date).toLocaleString("default", {
//         month: "short",
//         year: "numeric",
//       });

//       if (!acc[month])
//         acc[month] = { month, income: 0, expense: 0, balance: 0 };

//       if (record.type.toUpperCase() === "INCOME")
//         acc[month].income += record.amount;
//       else acc[month].expense += record.amount;

//       acc[month].balance = acc[month].income - acc[month].expense;
//       return acc;
//     }, {})
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="bg-deepest0 p-5 rounded-xl shadow-sm border border-secondary w-full"
//     >
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-display text-primary">Finance Overview</h2>

//         <div className="flex gap-2">
//           <button
//             onClick={() => setChartType("LINE")}
//             className={`px-3 py-2 flex items-center gap-1 rounded-lg text-sm ${
//               chartType === "LINE"
//                 ? "bg-accentPurple text-background"
//                 : "bg-secondary text-lightGray hover:bg-deeper"
//             } transition-colors`}
//           >
//             <TrendingUp className="w-4 h-4" /> Line
//           </button>
//           <button
//             onClick={() => setChartType("BAR")}
//             className={`px-3 py-2 flex items-center gap-1 rounded-lg text-sm ${
//               chartType === "BAR"
//                 ? "bg-accentTeal text-background"
//                 : "bg-secondary text-lightGray hover:bg-deeper"
//             } transition-colors`}
//           >
//             <BarChart2 className="w-4 h-4" /> Bar
//           </button>
//         </div>
//       </div>

//       <div className="h-64 sm:h-80 w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           {chartType === "LINE" ? (
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//               <XAxis dataKey="month" stroke="#aaa" />
//               <YAxis stroke="#aaa" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#1a1a1a",
//                   border: "1px solid #444",
//                   borderRadius: "8px",
//                 }}
//               />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="income"
//                 stroke="#4ade80"
//                 strokeWidth={2}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="expense"
//                 stroke="#f87171"
//                 strokeWidth={2}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="balance"
//                 stroke="#a78bfa"
//                 strokeWidth={2}
//               />
//             </LineChart>
//           ) : (
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//               <XAxis dataKey="month" stroke="#aaa" />
//               <YAxis stroke="#aaa" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#1a1a1a",
//                   border: "1px solid #444",
//                   borderRadius: "8px",
//                 }}
//               />
//               <Legend />
//               <Bar dataKey="income" fill="#4ade80" />
//               <Bar dataKey="expense" fill="#f87171" />
//               <Bar dataKey="balance" fill="#a78bfa" />
//             </BarChart>
//           )}
//         </ResponsiveContainer>
//       </div>
//     </motion.div>
//   );
// }

// "use client";

// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
// } from "recharts";
// import { FinanceRecord } from "@/types/finance";
// import { motion } from "framer-motion";

// type Props = {
//   records: FinanceRecord[];
// };

// export default function FinanceChart({ records }: Props) {
//   // Group by date for trend
//   const grouped = records.reduce<
//     Record<string, { income: number; expense: number }>
//   >((acc, rec) => {
//     const day = new Date(rec.date).toLocaleDateString();
//     if (!acc[day]) acc[day] = { income: 0, expense: 0 };
//     if (rec.type.toLowerCase().includes("income"))
//       acc[day].income += rec.amount;
//     else acc[day].expense += rec.amount;
//     return acc;
//   }, {});

//   const chartData = Object.entries(grouped).map(([date, val]) => ({
//     date,
//     income: val.income,
//     expense: val.expense,
//   }));

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="bg-deepest0 p-4 rounded-lg shadow-md w-full mb-6"
//     >
//       <h2 className="text-lg font-display text-primary mb-3">
//         Finance Overview
//       </h2>

//       {chartData.length > 0 ? (
//         <div className="w-full h-64 sm:h-80">
//           <ResponsiveContainer>
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#333" />
//               <XAxis dataKey="date" tick={{ fill: "#ccc", fontSize: 12 }} />
//               <YAxis tick={{ fill: "#ccc", fontSize: 12 }} />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#1e1e1e",
//                   borderRadius: "0.5rem",
//                   border: "1px solid #444",
//                 }}
//               />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="income"
//                 stroke="#00d8b3"
//                 strokeWidth={2}
//                 dot={false}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="expense"
//                 stroke="#a855f7"
//                 strokeWidth={2}
//                 dot={false}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       ) : (
//         <p className="text-lightGray text-sm text-center py-6">
//           No finance data available for chart
//         </p>
//       )}
//     </motion.div>
//   );
// }

"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { FinanceRecord } from "@/types/finance";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";

type Props = {
  records: FinanceRecord[];
};

export default function FinanceChart({ records }: Props) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // ✅ Group by month (YYYY-MM)
  const data = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};

    for (const rec of records) {
      const date = new Date(rec.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const isIncome =
        rec.type.toLowerCase().includes("income") ||
        rec.type.toLowerCase().includes("salary") ||
        rec.type.toLowerCase().includes("donation");

      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
      if (isIncome) grouped[key].income += rec.amount;
      else grouped[key].expense += rec.amount;
    }

    return Object.entries(grouped)
      .map(([month, { income, expense }]) => ({
        month,
        income,
        expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [records]);

  if (!records.length)
    return (
      <div className="bg-deepest0 p-6 rounded-lg text-lightGray text-center">
        No finance data to visualize.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-deepest0 p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display text-primary flex items-center gap-2">
          {chartType === "bar" ? (
            <BarChart3 className="text-accentPurple w-5 h-5" />
          ) : (
            <LineChartIcon className="text-accentPurple w-5 h-5" />
          )}
          Finance Trends
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 rounded text-sm ${
              chartType === "bar"
                ? "bg-accentPurple text-background"
                : "bg-secondary text-lightGray"
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 rounded text-sm ${
              chartType === "line"
                ? "bg-accentPurple text-background"
                : "bg-secondary text-lightGray"
            }`}
          >
            Line
          </button>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="income" fill="#00C49F" name="Income" />
              <Bar dataKey="expense" fill="#FF4D6D" name="Expense" />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#00C49F"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#FF4D6D"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
