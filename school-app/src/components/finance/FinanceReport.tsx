// "use client";

// import { motion } from "framer-motion";
// import { FinanceRecord } from "@/types/finance";
// import { BarChart3 } from "lucide-react";

// type Props = {
//   records: FinanceRecord[];
// };

// export default function FinanceReport({ records }: Props) {
//   if (!records.length)
//     return (
//       <div className="bg-deepest0 p-6 rounded-lg text-lightGray text-center">
//         No finance records yet.
//       </div>
//     );

//   // ✅ Group totals by type (case-insensitive)
//   const grouped = records.reduce<Record<string, number>>((acc, record) => {
//     const key = record.type.trim().toLowerCase();
//     acc[key] = (acc[key] || 0) + record.amount;
//     return acc;
//   }, {});

//   const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

//   const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="bg-deepest0 p-6 rounded-lg shadow-md mb-6"
//     >
//       <div className="flex items-center mb-4">
//         <BarChart3 className="text-accentPurple w-6 h-6 mr-2" />
//         <h2 className="text-xl font-display text-primary">Finance Breakdown</h2>
//       </div>

//       <div className="space-y-3">
//         {entries.map(([type, amount], idx) => {
//           const percentage = ((amount / total) * 100).toFixed(1);
//           const barColor =
//             type.includes("income") || type.includes("salary")
//               ? "bg-accentTeal"
//               : "bg-errorPink";

//           return (
//             <motion.div
//               key={type}
//               initial={{ opacity: 0, x: -10 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: idx * 0.1 }}
//             >
//               <div className="flex justify-between items-center mb-1">
//                 <span className="text-lightGray capitalize">{type}</span>
//                 <span className="text-lightGray text-sm">
//                   ₵{amount.toLocaleString()} ({percentage}%)
//                 </span>
//               </div>
//               <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
//                 <motion.div
//                   className={`${barColor} h-2 rounded-full`}
//                   initial={{ width: 0 }}
//                   animate={{ width: `${percentage}%` }}
//                   transition={{ duration: 0.6 }}
//                 />
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       <div className="border-t border-deep0 mt-4 pt-4 flex justify-between text-lightGray">
//         <span>Total</span>
//         <span className="font-semibold text-accentPurple">
//           ₵{total.toLocaleString()}
//         </span>
//       </div>
//     </motion.div>
//   );
// }

"use client";

import { motion } from "framer-motion";
import { FinanceRecord } from "@/types/finance";
import { BarChart3 } from "lucide-react";

type Props = {
  records: FinanceRecord[];
};

export default function FinanceReport({ records }: Props) {
  if (!records.length)
    return (
      <div className="bg-deepest0 p-6 rounded-lg text-lightGray text-center">
        No finance records yet.
      </div>
    );

  // ✅ Group totals by type (case-insensitive)
  const grouped = records.reduce<Record<string, number>>((acc, record) => {
    const key = record.type.trim().toLowerCase();
    acc[key] = (acc[key] || 0) + record.amount;
    return acc;
  }, {});

  const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-deepest0 p-6 rounded-lg shadow-md mb-6"
    >
      <div className="flex items-center mb-4">
        <BarChart3 className="text-accentPurple w-6 h-6 mr-2" />
        <h2 className="text-xl font-display text-primary">Finance Breakdown</h2>
      </div>

      <div className="space-y-3">
        {entries.map(([type, amount], idx) => {
          const percentage = ((amount / total) * 100).toFixed(1);
          const barColor =
            type.includes("income") || type.includes("salary")
              ? "bg-accentTeal"
              : "bg-errorPink";

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-lightGray capitalize">{type}</span>
                <span className="text-lightGray text-sm">
                  ₵{amount.toLocaleString()} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`${barColor} h-2 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-deep0 mt-4 pt-4 flex justify-between text-lightGray">
        <span>Total</span>
        <span className="font-semibold text-accentPurple">
          ₵{total.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
