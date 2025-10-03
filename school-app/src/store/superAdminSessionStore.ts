// stores/superAdminSessionStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

export interface SuperAdminSession {
  id: number;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  updatedAt: string;
}

interface SuperAdminSessionStore {
  sessions: SuperAdminSession[];
  isLoading: boolean;

  setSessions: (sessions: SuperAdminSession[]) => void;
  fetchSessions: () => Promise<void>;
}

export const useSuperAdminSessionStore = create<SuperAdminSessionStore>()(
  devtools((set) => ({
    sessions: [],
    isLoading: false,

    setSessions: (sessions) => set({ sessions }),

    fetchSessions: async () => {
      set({ isLoading: true });
      try {
        const res = await axios.get("/api/superadmin/me/updatedAt");
        // Only update sessions timestamps here
        const sessions = res.data.superAdminSessions || [];
        set({ sessions, isLoading: false });
      } catch (err) {
        console.error("Failed to fetch superadmin sessions", err);
        set({ isLoading: false });
      }
    },
  }))
);
