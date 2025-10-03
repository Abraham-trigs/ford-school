// stores/superAdminStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

export interface SchoolSession {
  id: number;
  name: string;
  slug?: string;
  startDate: string;
  endDate: string;
  metadata?: any;
  updatedAt: string;
  deletedAt?: string;
  classrooms: Classroom[];
  courses: Course[];
  resources: Resource[];
  transactions: FinancialTransaction[];
  transportation: Transportation[];
  memberships: UserMembership[];
}

export interface Classroom {
  id: string;
  name: string;
  gradeLevel: string;
  updatedAt: string;
  students: User[];
  graduationBatches: GraduationBatch[];
}

export interface Course {
  id: number;
  name: string;
  code?: string;
  updatedAt: string;
  assignments: Assignment[];
  students: User[];
  grades: Grade[];
}

export interface Resource {
  id: number;
  name: string;
  updatedAt: string;
}

export interface FinancialTransaction {
  id: number;
  type: string;
  amount: number;
  updatedAt: string;
  payments: Payment[];
}

export interface Transportation {
  id: number;
  routeName: string;
  vehicleType: string;
  updatedAt: string;
  stopsTable: TransportStop[];
}

export interface UserMembership {
  id: number;
  updatedAt: string;
  user: User;
}

export interface User {
  id: number;
  fullName: string;
  updatedAt: string;
}

export interface GraduationBatch {
  id: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  updatedAt: string;
}

export interface Grade {
  id: number;
  updatedAt: string;
}

export interface Payment {
  id: number;
  updatedAt: string;
}

interface SuperAdminStore {
  id: number | null;
  name: string;
  email: string;
  metadata?: any;
  updatedAt?: string;
  superAdminSessions: any[];
  schools: SchoolSession[];
  isLoading: boolean;

  setSuperAdminData: (data: Partial<SuperAdminStore>) => void;
  fetchMe: () => Promise<void>;
  fetchUpdatedAt: () => Promise<any>;
  updateIfChanged: () => Promise<void>;
}

export const useSuperAdminStore = create<SuperAdminStore>()(
  devtools((set, get) => ({
    id: null,
    name: "",
    email: "",
    metadata: undefined,
    updatedAt: undefined,
    superAdminSessions: [],
    schools: [],
    isLoading: false,

    setSuperAdminData: (data) => set((state) => ({ ...state, ...data })),

    fetchMe: async () => {
      set({ isLoading: true });
      try {
        const res = await axios.get("/api/superadmin/me");
        set({ ...res.data, isLoading: false });
      } catch (err) {
        console.error("Failed to fetch superadmin /me", err);
        set({ isLoading: false });
      }
    },

    fetchUpdatedAt: async () => {
      try {
        const res = await axios.get("/api/superadmin/me/updatedAt");
        return res.data;
      } catch (err) {
        console.error("Failed to fetch /me/updatedAt", err);
        return null;
      }
    },

    updateIfChanged: async () => {
      const timestamps = await get().fetchUpdatedAt();
      if (!timestamps) return;

      // Compare superadmin top-level updatedAt
      if (timestamps.updatedAt !== get().updatedAt) {
        await get().fetchMe();
        return;
      }

      // Check each school updatedAt
      for (const school of get().schools) {
        const newSchool = timestamps.sessions.find((s: any) => s.id === school.id);
        if (newSchool && newSchool.updatedAt !== school.updatedAt) {
          await get().fetchMe();
          return; // fetch full data if any school changed
        }
      }
    },
  }))
);
