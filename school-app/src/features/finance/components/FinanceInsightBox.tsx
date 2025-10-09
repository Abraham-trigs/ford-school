// "use client";

// import { motion } from "framer-motion";
// import { FinanceRecord } from "@/types/finance";
// import React, { useMemo } from "react";

// /**
//  * FinanceInsightBox
//  * Generates short narrative insights from finance records.
//  * Lightweight, deterministic rules: percent change, top categories, anomalies.
//  */

// type Props = {
//   records: FinanceRecord[];
//   limit?: number; // top N categories to show
// };

// function percentChange(prev: number, curr: number) {
//   if (prev === 0) return curr === 0 ? 0 : 100;
//   return ((curr - prev) / Math.abs(prev)) * 100;
// }

// export default function FinanceInsightBox({ records, limit = 3 }: Props) {
//   const summary = useMemo(() => {
//     const now = new Date();
//     // helper to get YYYY-MM
//     const monthKey = (d: Date) =>
//       `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//     // group by month and type
//     const byMonth: Record<
//       string,
//       { income: number; expense: number; categories: Record<string, number> }
//     > = {};

//     for (const r of records) {
//       const d = new Date(r.date);
//       const key = monthKey(d);
//       if (!byMonth[key])
//         byMonth[key] = { income: 0, expense: 0, categories: {} };
//       const normalizedType = r.type.trim();
//       const isIncome =
//         normalizedType.toUpperCase().includes("INCOME") ||
//         normalizedType.toUpperCase().includes("SALARY") ||
//         normalizedType.toUpperCase().includes("DONATION");
//       if (isIncome) byMonth[key].income += r.amount;
//       else byMonth[key].expense += r.amount;

//       const cat = normalizedType.toLowerCase();
//       byMonth[key].categories[cat] =
//         (byMonth[key].categories[cat] || 0) + r.amount;
//     }

//     // pick current & previous month keys
//     const currentKey = monthKey(now);
//     const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const prevKey = monthKey(prevDate);

//     const curr = byMonth[currentKey] || {
//       income: 0,
//       expense: 0,
//       categories: {},
//     };
//     const prev = byMonth[prevKey] || { income: 0, expense: 0, categories: {} };

//     // top categories this month
//     const topCategories = Object.entries(curr.categories)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, limit)
//       .map(([k, v]) => ({ category: k, amount: v }));

//     // detect anomalies (simple rule: category jump > 50% vs prev month)
//     const anomalies: {
//       category: string;
//       prev: number;
//       curr: number;
//       pct: number;
//     }[] = [];
//     for (const [cat, amt] of Object.entries(curr.categories)) {
//       const prevAmt = prev.categories[cat] || 0;
//       const pct = percentChange(prevAmt, amt);
//       if (Math.abs(pct) >= 50) {
//         anomalies.push({ category: cat, prev: prevAmt, curr: amt, pct });
//       }
//     }

//     const incomeChange = percentChange(prev.income, curr.income);
//     const expenseChange = percentChange(prev.expense, curr.expense);

//     return {
//       current: curr,
//       previous: prev,
//       topCategories,
//       anomalies,
//       incomeChange,
//       expenseChange,
//     };
//   }, [records, limit]);

//   // Build narrative lines
//   const lines = useMemo(() => {
//     const out: string[] = [];
//     const {
//       current,
//       previous,
//       topCategories,
//       anomalies,
//       incomeChange,
//       expenseChange,
//     } = summary;

//     out.push(
//       `This month: Income ${current.income.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ` +
//         `Expenses ${current.expense.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`
//     );

//     out.push(
//       `Income ${incomeChange >= 0 ? "increased" : "decreased"} ${Math.abs(Math.round(incomeChange))}% vs last month.`
//     );

//     out.push(
//       `Expenses ${expenseChange >= 0 ? "increased" : "decreased"} ${Math.abs(Math.round(expenseChange))}% vs last month.`
//     );

//     if (topCategories.length) {
//       const top = topCategories
//         .map((t) => `${t.category} (₵${t.amount.toLocaleString()})`)
//         .join(", ");
//       out.push(`Top categories: ${top}.`);
//     }

//     if (anomalies.length) {
//       const items = anomalies
//         .slice(0, 3)
//         .map(
//           (a) =>
//             `${a.category} ${a.pct >= 0 ? "up" : "down"} ${Math.abs(Math.round(a.pct))}%`
//         );
//       out.push(`Notable changes: ${items.join("; ")}.`);
//     } else {
//       out.push("No large category anomalies detected.");
//     }

//     return out;
//   }, [summary]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.28 }}
//       className="bg-deepest0 border border-secondary rounded-lg p-4 shadow-sm"
//     >
//       <h3 className="text-md font-display text-primary mb-2">Insights</h3>

//       <div className="text-sm text-lightGray space-y-2">
//         {lines.map((l, i) => (
//           <p key={i} className="leading-relaxed">
//             {l}
//           </p>
//         ))}
//       </div>

//       <div className="mt-3 text-xs text-muted">
//         Tip: you can connect this box to a server-side insights endpoint later
//         for richer, LLM-generated narratives.
//       </div>
//     </motion.div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { FinanceRecord } from "@/types/finance";
// import { motion } from "framer-motion";

// type Props = {
//   records: FinanceRecord[];
//   from?: string;
//   to?: string;
// };

// export default function FinanceInsightBox({ records, from, to }: Props) {
//   const [narrative, setNarrative] = useState<string>("Generating insights...");
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInsight = async () => {
//       try {
//         const res = await fetch("/api/insights/finance", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ from, to }),
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Insight API error");
//         setNarrative(data.insight.narrative);
//       } catch (err: any) {
//         console.error("Insight fetch:", err);
//         setError("Could not load insights");
//         setNarrative("");
//       }
//     };

//     fetchInsight();
//   }, [records, from, to]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.28 }}
//       className="bg-deepest0 border border-secondary rounded-lg p-4 shadow-sm"
//     >
//       <h3 className="text-md font-display text-primary mb-2">Insights</h3>
//       {error ? (
//         <p className="text-errorPink text-sm">{error}</p>
//       ) : (
//         <p className="text-sm text-lightGray leading-relaxed">{narrative}</p>
//       )}
//     </motion.div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

type FinanceInsights = {
  summary: string;
  trends: string[];
  recommendations: string[];
};

export default function FinanceInsightBox() {
  const [insights, setInsights] = useState<FinanceInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/insights/finance", {
        params: { refresh: forceRefresh },
      });
      setInsights(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading && !insights)
    return (
      <div className="p-6 bg-deepest0 rounded-lg text-lightGray flex items-center justify-center shadow-md">
        <Loader2 className="animate-spin mr-2" /> Loading financial insights...
      </div>
    );

  if (!insights)
    return (
      <div className="p-6 bg-deepest0 rounded-lg text-lightGray text-center shadow-md">
        No insights available yet.
        <button
          onClick={() => fetchInsights(true)}
          className="mt-3 px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition"
        >
          Generate Insights
        </button>
      </div>
    );

  return (
    <motion.div
      className="p-6 bg-deepest0 rounded-xl shadow-md border border-deeper text-lightGray flex flex-col gap-4 md:gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-display text-accentTeal">
          Finance Insights
        </h2>
        <button
          onClick={() => fetchInsights(true)}
          className="flex items-center space-x-2 text-sm text-accentPurple hover:text-purple0 transition"
        >
          <RefreshCcw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-1">Summary</h3>
        <p className="text-sm md:text-base leading-relaxed">
          {insights.summary}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-1">Trends</h3>
        <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
          {insights.trends.map((trend, i) => (
            <li key={i}>{trend}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-1">Recommendations</h3>
        <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
          {insights.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      {loading && (
        <div className="flex items-center text-accentPurple text-sm">
          <Loader2 className="animate-spin mr-2" /> Updating insights...
        </div>
      )}
    </motion.div>
  );
}
