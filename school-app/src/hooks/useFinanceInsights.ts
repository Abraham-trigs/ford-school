"use client";

import useSWR from "swr";
import axios from "axios";
import { toast } from "react-toastify";

export type FinanceInsight = {
  summary: string;
  trends: string[];
  recommendations: string[];
};

const fetcher = async (url: string): Promise<FinanceInsight> => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    console.error("❌ Failed to fetch finance insights:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch insights");
  }
};

export function useFinanceInsights() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<FinanceInsight>("/api/insights", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 5, // 5 min
  });

  const refresh = async () => {
    try {
      toast.info("Refreshing insights...");
      const newData = await fetcher("/api/insights?refresh=true");
      await mutate(newData, { revalidate: false });
      toast.success("Insights refreshed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh insights");
    }
  };

  return {
    insights: data,
    loading: isLoading,
    error,
    refresh,
  };
}
