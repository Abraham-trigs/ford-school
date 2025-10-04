import { create } from "zustand";
import { apiGetTransactions, apiGetTransactionById } from "@/lib/api/transactions";

export interface Transaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE";
  description?: string;
  date: string;
  userId: number;
  [key: string]: any;
}

interface TransactionsState {
  transactions: Transaction[];
  transactionMap: Record<number, Transaction>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: { type?: "INCOME" | "EXPENSE"; search?: string };
  
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ type: "INCOME" | "EXPENSE"; search: string }>) => void;

  fetchTransactions: () => Promise<void>;
  fetchTransactionById: (id: number) => Promise<Transaction | null>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  transactionMap: {},
  loading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  filter: {},

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setFilter: (filter) => set({ filter }),

  fetchTransactions: async () => {
    const { page, pageSize, filter } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetTransactions({ 
        page, 
        pageSize, 
        type: filter.type, 
        search: filter.search 
      });

      const map: Record<number, Transaction> = {};
      data.forEach((t: Transaction) => (map[t.id] = t));

      set({
        transactions: data,
        transactionMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchTransactionById: async (id: number) => {
    const cached = get().transactionMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const transaction = await apiGetTransactionById(id);
      set(state => ({
        transactionMap: { ...state.transactionMap, [id]: transaction },
        loading: false,
      }));
      return transaction;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
