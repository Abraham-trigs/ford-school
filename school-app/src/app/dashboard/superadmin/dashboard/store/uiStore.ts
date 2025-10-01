"use client";

import { create } from "zustand";

interface UIState {
  // Desktop
  sidebarCollapsed: boolean;

  // Mobile
  mobileSidebarOpen: boolean;

  // Window width
  screenWidth: number;

  // Actions
  toggleSidebar: () => void;          // Desktop collapse < / >
  toggleMobileSidebar: () => void;    // Mobile hamburger
  setScreenWidth: (width: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  screenWidth: typeof window !== "undefined" ? window.innerWidth : 1024,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  setScreenWidth: (width: number) => set({ screenWidth: width }),
}));
