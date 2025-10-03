import { create } from "zustand";
import { apiLogin, apiLogout, apiRefresh, apiGetProfile } from "@/lib/api/session";
import jwtDecode from "jwt-decode";

interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { token, refreshToken } = await apiLogin(email, password);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      const decoded: any = jwtDecode(token);
      const user: User = decoded.user;

      set({ token, refreshToken, user, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    const { token } = get();
    if (token) await apiLogout(token);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return get().logout();

    try {
      const { token: newToken, refreshToken: newRefresh } = await apiRefresh(refreshToken);
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefresh);

      const decoded: any = jwtDecode(newToken);
      const user: User = decoded.user;

      set({ token: newToken, refreshToken: newRefresh, user, isAuthenticated: true });
    } catch (err) {
      console.error(err);
      get().logout();
    }
  },

  hydrate: async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!token || !refreshToken) {
      set({ loading: false });
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        await get().refresh();
        set({ loading: false });
        return;
      }

      const user = await apiGetProfile(token);
      set({ token, refreshToken, user, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error(err);
      await get().refresh();
      set({ loading: false });
    }
  },
}));
