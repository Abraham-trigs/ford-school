"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  mobileSidebarOpen: boolean;
  collapsedSections: Record<string, Record<string, boolean>>;
  search: Record<string, string>;
  badgeCounts: Record<string, number>;

  // UI Toggles
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Section Management
  toggleSection: (role: string, key: string) => void;
  setCollapsedSections: (role: string, sections: Record<string, boolean>) => void;

  // Search
  setSearch: (role: string, value: string) => void;

  // Badges
  setBadgeCount: (key: string, count: number) => void;
  incrementBadge: (key: string, by?: number) => void;
  decrementBadge: (key: string, by?: number) => void;

  // ✅ Helpers for components
  getCollapsedSectionsForRole: (role: string) => Record<string, boolean>;
  getSearchForRole: (role: string) => string;
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

      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      toggleSection: (role, key) => {
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

      setCollapsedSections: (role, sections) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [role]: { ...sections },
          },
        })),

      setSearch: (role, value) =>
        set((state) => ({
          search: {
            ...state.search,
            [role]: value,
          },
        })),

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

      // ✅ New helpers
      getCollapsedSectionsForRole: (role) =>
        get().collapsedSections[role] || {},

      getSearchForRole: (role) => get().search[role] || "",
    }),
    { name: "sidebar-storage" }
  )
);
