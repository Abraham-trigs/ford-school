"use client";

import dynamic from "next/dynamic";
import { FinanceRecord } from "@/types/finance";
import FinanceSummary from "./FinanceSummary";

// ✅ Lazy-load charts (improves initial page performance)
const FinanceChart = dynamic(() => import("./FinanceChart"), { ssr: false });
const FinanceTrendChart = dynamic(() => import("./FinanceTrendChart"), {
  ssr: false,
});

export default function FinanceAnalytics({
  records,
}: {
  records: FinanceRecord[];
}) {
  return (
    <section className="w-full mt-6 space-y-6">
      {/* ===== SUMMARY BAR ===== */}
      <FinanceSummary records={records} />

      {/* ===== CHART GRID ===== */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-6
          bg-deepest0
          rounded-2xl
          p-4
          shadow-sm
        "
      >
        {/* Chart 1: Category Distribution */}
        <div className="flex flex-col bg-background rounded-xl p-4 shadow-md border border-muted/20">
          <h2 className="text-lg font-semibold text-primary mb-3">
            Distribution by Type
          </h2>
          <FinanceChart records={records} />
        </div>

        {/* Chart 2: Monthly Trends */}
        <div className="flex flex-col bg-background rounded-xl p-4 shadow-md border border-muted/20">
          <h2 className="text-lg font-semibold text-primary mb-3">
            Monthly Trends
          </h2>
          <FinanceTrendChart records={records} />
        </div>
      </div>
    </section>
  );
}
