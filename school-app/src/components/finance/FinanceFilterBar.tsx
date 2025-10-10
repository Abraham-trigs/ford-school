"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, RefreshCcw } from "lucide-react";
import { FinanceRecord } from "@/types/finance";

type Props = {
  records: FinanceRecord[];
  onFilter: (filtered: FinanceRecord[]) => void;
};

export default function FinanceFilterBar({ records, onFilter }: Props) {
  const [type, setType] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Recalculate filtered data whenever filters change
  useEffect(() => {
    let filtered = [...records];

    if (type !== "ALL") filtered = filtered.filter((r) => r.type === type);

    if (startDate)
      filtered = filtered.filter(
        (r) => new Date(r.date) >= new Date(startDate)
      );

    if (endDate)
      filtered = filtered.filter((r) => new Date(r.date) <= new Date(endDate));

    onFilter(filtered);
  }, [type, startDate, endDate, records, onFilter]);

  const resetFilters = () => {
    setType("ALL");
    setStartDate("");
    setEndDate("");
    onFilter(records);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-deepest0 p-4 rounded-xl shadow-sm border border-secondary"
    >
      <div className="flex items-center gap-2 text-lightGray font-display text-sm">
        <Filter className="w-4 h-4" />
        <span>Filter Finance Records</span>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Type Selector */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary text-lightGray text-sm focus:outline-none focus:ring-2 focus:ring-accentPurple"
        >
          <option value="ALL">All</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-lightGray" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 rounded-lg bg-secondary text-lightGray text-sm focus:outline-none focus:ring-2 focus:ring-accentPurple"
          />
          <span className="text-lightGray">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1 rounded-lg bg-secondary text-lightGray text-sm focus:outline-none focus:ring-2 focus:ring-accentPurple"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-3 py-2 bg-accentTeal text-background rounded-lg text-sm hover:bg-teal-500 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Reset
        </button>
      </div>
    </motion.div>
  );
}
