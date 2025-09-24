"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  mobileSidebarOpen: boolean;
  collapsedSections: Record<string, Record<string, boolean>>;
  search: Record<string, string>;
  badgeCounts: Record<string, number>;

  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSection: (role: string, key: string) => void;
  setCollapsedSections: (role: string, sections: Record<string, boolean>) => void;
  setSearch: (role: string, value: string) => void;

  setBadgeCount: (key: string, count: number) => void;
  incrementBadge: (key: string, by?: number) => void;
  decrementBadge: (key: string, by?: number) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      mobileSidebarOpen: false,
      collapsedSections: {},
      search: {},
      badgeCounts: {},

      toggleMobileSidebar: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

      setMobileSidebarOpen: (open: boolean) => set({ mobileSidebarOpen: open }),

      toggleSection: (role: string, key: string) => {
        const state = get();
        const roleSections = state.collapsedSections[role] || {};
        set({
          collapsedSections: {
            ...state.collapsedSections,
            [role]: {
              ...roleSections,
              [key]: !roleSections[key],
            },
          },
        });
      },

      setCollapsedSections: (role: string, sections: Record<string, boolean>) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [role]: sections,
          },
        })),

      setSearch: (role: string, value: string) => {
        const state = get();
        set({
          search: {
            ...state.search,
            [role]: value,
          },
        });
      },

      setBadgeCount: (key, count) =>
        set((state) => ({
          badgeCounts: { ...state.badgeCounts, [key]: count },
        })),

      incrementBadge: (key, by = 1) =>
        set((state) => ({
          badgeCounts: {
            ...state.badgeCounts,
            [key]: (state.badgeCounts[key] || 0) + by,
          },
        })),

      decrementBadge: (key, by = 1) =>
        set((state) => ({
          badgeCounts: {
            ...state.badgeCounts,
            [key]: Math.max((state.badgeCounts[key] || 0) - by, 0),
          },
        })),
    }),
    { name: "sidebar-storage" }
  )
);
