// "use client";

// import { useMemo } from "react";
// import { FinanceRecord } from "@/types/finance";

// export default function FinanceSummary({
//   records,
// }: {
//   records: FinanceRecord[];
// }) {
//   const { totalIncome, totalExpense, balance } = useMemo(() => {
//     let totalIncome = 0;
//     let totalExpense = 0;

//     records.forEach((r) => {
//       const type = r.type.toLowerCase();
//       if (type.includes("income") || type.includes("credit")) {
//         totalIncome += r.amount;
//       } else if (type.includes("expense") || type.includes("debit")) {
//         totalExpense += r.amount;
//       } else {
//         totalExpense += r.amount; // default unknown as expense
//       }
//     });

//     return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
//   }, [records]);

//   const cardClass =
//     "flex flex-col justify-center items-center bg-deepest0 p-5 rounded-xl shadow-md w-full sm:w-1/3 transition-transform hover:scale-[1.02]";

//   const format = (n: number) =>
//     `₵${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

//   return (
//     <div className="flex flex-col sm:flex-row gap-4 mb-6">
//       <div className={`${cardClass}`}>
//         <span className="text-sm text-gray-400">Total Income</span>
//         <span className="text-2xl font-semibold text-green-400">
//           {format(totalIncome)}
//         </span>
//       </div>
//       <div className={`${cardClass}`}>
//         <span className="text-sm text-gray-400">Total Expense</span>
//         <span className="text-2xl font-semibold text-red-400">
//           {format(totalExpense)}
//         </span>
//       </div>
//       <div className={`${cardClass}`}>
//         <span className="text-sm text-gray-400">Net Balance</span>
//         <span
//           className={`text-2xl font-semibold ${
//             balance >= 0 ? "text-teal-400" : "text-orange-400"
//           }`}
//         >
//           {format(balance)}
//         </span>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { motion } from "framer-motion";
// import { FinanceRecord } from "@/types/finance";
// import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

// type Props = { records: FinanceRecord[] };

// export default function FinanceSummary({ records }: Props) {
//   const income = records
//     .filter((r) => r.type === "INCOME")
//     .reduce((sum, r) => sum + Number(r.amount), 0);

//   const expense = records
//     .filter((r) => r.type === "EXPENSE")
//     .reduce((sum, r) => sum + Number(r.amount), 0);

//   const net = income - expense;
//   const transactions = records.length;

//   const summary = [
//     {
//       title: "Total Income",
//       value: income,
//       icon: ArrowUpRight,
//       color: "from-green-500 to-emerald-400",
//     },
//     {
//       title: "Total Expenses",
//       value: expense,
//       icon: ArrowDownRight,
//       color: "from-rose-500 to-pink-400",
//     },
//     {
//       title: "Net Balance",
//       value: net,
//       icon: Wallet,
//       color:
//         net >= 0 ? "from-blue-500 to-indigo-400" : "from-red-500 to-pink-500",
//     },
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
//     >
//       {summary.map((item, i) => (
//         <motion.div
//           key={i}
//           whileHover={{ scale: 1.03 }}
//           className={`flex flex-col justify-between bg-gradient-to-br ${item.color} text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all`}
//         >
//           <div className="flex items-center justify-between mb-2">
//             <p className="font-medium text-sm opacity-90">{item.title}</p>
//             <item.icon className="w-5 h-5 opacity-80" />
//           </div>
//           <h2 className="text-2xl sm:text-3xl font-semibold">
//             ${item.value.toLocaleString()}
//           </h2>
//         </motion.div>
//       ))}

//       {/* Extra: Transaction count */}
//       <motion.div
//         whileHover={{ scale: 1.03 }}
//         className="bg-gradient-to-br from-purple-500 to-purple-400 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all sm:col-span-3"
//       >
//         <div className="flex items-center justify-between mb-2">
//           <p className="font-medium text-sm opacity-90">Total Transactions</p>
//           <span className="text-lg font-semibold">{transactions}</span>
//         </div>
//         <p className="text-sm opacity-75">
//           {transactions > 0
//             ? "All records included in summary."
//             : "No finance data available."}
//         </p>
//       </motion.div>
//     </motion.div>
//   );
// }

// "use client";

// import { motion } from "framer-motion";
// import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
// import { FinanceRecord } from "@/types/finance";

// type Props = {
//   records: FinanceRecord[];
// };

// export default function FinanceSummary({ records }: Props) {
//   const income = records
//     .filter((r) => r.type.toUpperCase() === "INCOME")
//     .reduce((sum, r) => sum + r.amount, 0);

//   const expense = records
//     .filter((r) => r.type.toUpperCase() === "EXPENSE")
//     .reduce((sum, r) => sum + r.amount, 0);

//   const balance = income - expense;

//   const summary = [
//     {
//       label: "Total Income",
//       value: income,
//       icon: TrendingUp,
//       color: "text-green-400",
//       bg: "bg-green-500/10",
//     },
//     {
//       label: "Total Expense",
//       value: expense,
//       icon: TrendingDown,
//       color: "text-red-400",
//       bg: "bg-red-500/10",
//     },
//     {
//       label: "Net Balance",
//       value: balance,
//       icon: Wallet,
//       color: balance >= 0 ? "text-purple-400" : "text-orange-400",
//       bg: balance >= 0 ? "bg-purple-500/10" : "bg-orange-500/10",
//     },
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5"
//     >
//       {summary.map((item) => (
//         <motion.div
//           key={item.label}
//           whileHover={{ scale: 1.02 }}
//           className={`p-4 rounded-xl border border-secondary shadow-sm ${item.bg} transition-all`}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-400">{item.label}</p>
//               <h3 className="text-2xl font-bold text-primary mt-1">
//                 ₵{item.value.toLocaleString()}
//               </h3>
//             </div>
//             <div
//               className={`p-2 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}
//             >
//               <item.icon className="w-6 h-6" />
//             </div>
//           </div>
//         </motion.div>
//       ))}
//     </motion.div>
//   );
// }

"use client";

import { motion } from "framer-motion";
import { FinanceRecord } from "@/types/finance";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

type Props = {
  records: FinanceRecord[];
};

export default function FinanceSummary({ records }: Props) {
  const totals = records.reduce(
    (acc, rec) => {
      if (rec.type.toLowerCase().includes("income")) acc.income += rec.amount;
      else acc.expense += rec.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = totals.income - totals.expense;

  const summaryData = [
    {
      title: "Total Income",
      value: totals.income,
      icon: <ArrowUpCircle className="w-6 h-6 text-accentTeal" />,
      color: "text-accentTeal",
    },
    {
      title: "Total Expenses",
      value: totals.expense,
      icon: <ArrowDownCircle className="w-6 h-6 text-errorPink" />,
      color: "text-errorPink",
    },
    {
      title: "Balance",
      value: balance,
      icon: <Wallet className="w-6 h-6 text-accentPurple" />,
      color: balance >= 0 ? "text-accentPurple" : "text-errorPink",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {summaryData.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-deepest0 rounded-lg p-4 flex items-center justify-between shadow hover:shadow-md transition-shadow"
        >
          <div>
            <p className="text-lightGray text-sm">{item.title}</p>
            <h3 className={`text-xl sm:text-2xl font-bold ${item.color}`}>
              ₵{item.value.toLocaleString()}
            </h3>
          </div>
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
}
