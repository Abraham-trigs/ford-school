"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  mobileSidebarOpen: boolean;
  collapsedSections: Record<string, Record<string, boolean>>;
  search: Record<string, string>;
  badgeCounts: Record<string, number>; // <- badges centralized here

  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSection: (role: string, key: string) => void;
  setCollapsedSections: (role: string, sections: Record<string, boolean>) => void;
  setSearch: (role: string, value: string) => void;

  setBadgeCount: (key: string, count: number) => void; // <- new action
  incrementBadge: (key: string, by?: number) => void; // optional helper
  decrementBadge: (key: string, by?: number) => void; // optional helper
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

      toggleSection: (role: string, key: string) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [role]: {
              ...state.collapsedSections[role],
              [key]: !state.collapsedSections[role]?.[key],
            },
          },
        })),

      setCollapsedSections: (role: string, sections: Record<string, boolean>) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [role]: sections,
          },
        })),

      setSearch: (role: string, value: string) =>
        set((state) => ({
          search: {
            ...state.search,
            [role]: value,
          },
        })),

      // new badge actions
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
    {
      name: "sidebar-storage",
    }
  )
);
