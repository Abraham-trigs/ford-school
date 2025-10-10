"use client";

import { motion } from "framer-motion";
import React from "react";

type Props = {
  title: string;
  value: number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: string; // tailwind text color (e.g. "text-green-400")
};

export default function FinanceStatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "text-primary",
}: Props) {
  const fmt = (n: number) =>
    `₵${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="bg-deepest0 border border-secondary rounded-xl p-4 flex items-center justify-between shadow-sm"
    >
      <div className="flex flex-col">
        <span className="text-xs text-lightGray">{title}</span>
        <span className={`text-xl sm:text-2xl font-semibold ${accent}`}>
          {fmt(value)}
        </span>
        {subtitle && (
          <span className="text-xs text-muted mt-1">{subtitle}</span>
        )}
      </div>

      {icon && <div className="ml-3 text-2xl opacity-80">{icon}</div>}
    </motion.div>
  );
}
