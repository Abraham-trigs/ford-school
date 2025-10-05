import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserFilters } from "@/store/userFilters";

/* ------------------------- Extended Filters Contract ------------------------- */
interface UserFilterState
  extends Omit<UserFilters, "sortField" | "sortDirection"> {
  sort: { field: UserFilters["sortField"]; direction: UserFilters["sortDirection"] };
  search?: string;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setRole: (role?: string) => void;
  setActive: (active?: boolean) => void;
  setSort: (sort: UserFilterState["sort"]) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

/* ------------------------- Default Values ------------------------- */
const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 20,
  role: undefined,
  active: undefined,
  search: "",
  sort: { field: "fullName", direction: "asc" } as const,
};

/* ------------------------- Zustand Store (Persisted) ------------------------- */
export const useUserFilters = create<UserFilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,

      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize }),
      setRole: (role) => set({ role }),
      setActive: (active) => set({ active }),
      setSort: (sort) => set({ sort }),
      setSearch: (search) => set({ search }),

      resetFilters: () => set(DEFAULT_FILTERS),
    }),
    {
      name: "user-filters", // Key in localStorage
      partialize: (state) => ({
        page: state.page,
        pageSize: state.pageSize,
        role: state.role,
        active: state.active,
        sort: state.sort,
        search: state.search,
      }),
    }
  )
);
