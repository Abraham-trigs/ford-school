import { create } from "zustand";

interface SuperAdmin {
  id: number;
  name: string;
  email: string;
}

interface SuperAdminState {
  superAdmin: SuperAdmin | null;
  token: string | null; // access token
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSuperAdmin: (
    superAdmin: SuperAdmin,
    accessToken: string,
    refreshToken?: string
  ) => void;
  logout: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  superAdmin: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  setSuperAdmin: (superAdmin, accessToken, refreshToken) => {
    set(() => ({
      superAdmin,
      token: accessToken,
      refreshToken: refreshToken ?? null,
      isAuthenticated: true,
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("superAdmin", JSON.stringify(superAdmin));
      localStorage.setItem("superAdminToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("superAdminRefreshToken", refreshToken);
      }
    }
  },

  logout: () => {
    set(() => ({
      superAdmin: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    }));

    if (typeof window !== "undefined") {
      localStorage.removeItem("superAdmin");
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("superAdminRefreshToken");
    }
  },
}));

// ✅ Hydrate state from localStorage
export const hydrateSuperAdmin = () => {
  if (typeof window === "undefined") return;

  const storedAdmin = localStorage.getItem("superAdmin");
  const storedToken = localStorage.getItem("superAdminToken");
  const storedRefresh = localStorage.getItem("superAdminRefreshToken");

  if (storedAdmin && storedToken) {
    useSuperAdminStore
      .getState()
      .setSuperAdmin(JSON.parse(storedAdmin), storedToken, storedRefresh ?? undefined);
  }
};
