// store/superAdminStore.ts
import { create } from "zustand";

export interface SuperAdmin {
  id: number;
  name: string;
  email: string;
}

interface SuperAdminState {
  superAdmin: SuperAdmin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSuperAdmin: (superAdmin: SuperAdmin, accessToken: string) => void;
  logout: () => void;
  hydrateSuperAdmin: () => Promise<void>;
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  superAdmin: null,
  accessToken: null,
  isAuthenticated: false,

  // Set superadmin info and access token in memory
  setSuperAdmin: (superAdmin, accessToken) =>
    set(() => ({
      superAdmin,
      accessToken,
      isAuthenticated: true,
    })),

  // Logout: clear store and refresh token
  logout: () =>
    set(() => {
      localStorage.removeItem("superAdminRefreshToken");
      return {
        superAdmin: null,
        accessToken: null,
        isAuthenticated: false,
      };
    }),

  // Hydrate store from refresh token
  hydrateSuperAdmin: async () => {
    const refreshToken = localStorage.getItem("superAdminRefreshToken");
    if (!refreshToken) return;

    try {
      const res = await fetch("/api/auth/superadmin/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();

      set({
        superAdmin: data.superAdmin,
        accessToken: data.accessToken,
        isAuthenticated: true,
      });
    } catch (err) {
      console.warn("Session restore failed", err);
      localStorage.removeItem("superAdminRefreshToken");
      set({ superAdmin: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
