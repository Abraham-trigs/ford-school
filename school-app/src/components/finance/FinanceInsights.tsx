"use client";

import React, { useMemo } from "react";
import FinanceStatCard from "./FinanceStatCard";
import FinanceInsightBox from "./FinanceInsightBox";
import { FinanceRecord } from "@/types/finance";
import { ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

/**
 * FinanceInsights
 * - Accepts records[] and renders:
 *   - 3 stat cards (income, expense, balance)
 *   - narrative insight box (top categories, changes, anomalies)
 *
 * Mobile-first responsive layout (1 column → 2 columns on sm → 3 cards row on md)
 */

type Props = {
  records: FinanceRecord[];
};

export default function FinanceInsights({ records }: Props) {
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const r of records) {
      if (
        r.type.toUpperCase().includes("INCOME") ||
        r.type.toUpperCase().includes("SALARY") ||
        r.type.toUpperCase().includes("DONATION")
      ) {
        income += r.amount;
      } else {
        expense += r.amount;
      }
    }
    return { income, expense, balance: income - expense };
  }, [records]);

  return (
    <section className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FinanceStatCard
          title="Total Income"
          value={totals.income}
          subtitle="All incoming funds this period"
          icon={<ArrowUpRight className="w-6 h-6" />}
          accent="text-accentTeal"
        />

        <FinanceStatCard
          title="Total Expense"
          value={totals.expense}
          subtitle="All outgoing costs this period"
          icon={<ArrowDownRight className="w-6 h-6" />}
          accent="text-errorPink"
        />

        <FinanceStatCard
          title="Net Balance"
          value={totals.balance}
          subtitle={totals.balance >= 0 ? "Surplus" : "Deficit"}
          icon={<CreditCard className="w-6 h-6" />}
          accent={totals.balance >= 0 ? "text-accentPurple" : "text-errorPink"}
        />
      </div>

      {/* Insights narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FinanceInsightBox records={records} />
        </div>

        <div>
          {/* small contextual card (future quick actions) */}
          <div className="bg-deepest0 border border-secondary rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-primary mb-2">
              Quick actions
            </h4>
            <ul className="text-sm text-lightGray space-y-2">
              <li>- Export filtered report</li>
              <li>- Compare with previous quarter</li>
              <li>- Flag unusual transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
