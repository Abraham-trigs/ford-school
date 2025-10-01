import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activePath: string;

  // actions
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setActivePath: (path: string) => void;
  initializeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePath: "/dashboard/superadmin", // default path

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  closeSidebar: () => set({ sidebarOpen: false }),

  openSidebar: () => set({ sidebarOpen: true }),

  setActivePath: (path: string) => set({ activePath: path }),

  initializeSidebar: () => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      set({ sidebarOpen: !isMobile });
    }
  },
}));
