import { create } from "zustand";

interface SuperAdmin {
  id: number;
  name: string;
  email: string;
}

interface SuperAdminState {
  superAdmin: SuperAdmin | null;
  token: string | null;
  isAuthenticated: boolean;
  setSuperAdmin: (superAdmin: SuperAdmin, token: string) => void;
  logout: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  superAdmin: null,
  token: null,
  isAuthenticated: false,

  setSuperAdmin: (superAdmin, token) => {
    set(() => ({
      superAdmin,
      token,
      isAuthenticated: true,
    }));

    // Optionally store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("superAdmin", JSON.stringify(superAdmin));
      localStorage.setItem("superAdminToken", token);
    }
  },

  logout: () => {
    set(() => ({
      superAdmin: null,
      token: null,
      isAuthenticated: false,
    }));

    if (typeof window !== "undefined") {
      localStorage.removeItem("superAdmin");
      localStorage.removeItem("superAdminToken");
    }
  },
}));

// Optional: hydrate from localStorage on app load
export const hydrateSuperAdmin = () => {
  if (typeof window === "undefined") return;

  const storedAdmin = localStorage.getItem("superAdmin");
  const storedToken = localStorage.getItem("superAdminToken");

  if (storedAdmin && storedToken) {
    useSuperAdminStore.getState().setSuperAdmin(
      JSON.parse(storedAdmin),
      storedToken
    );
  }
};
