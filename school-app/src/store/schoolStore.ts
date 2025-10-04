import { create } from "zustand";
import { apiGetSchools, apiGetSchoolById } from "@/lib/api/schools";

export interface School {
  id: number;
  name: string;
  address?: string;
  startDate?: string;
  endDate?: string;
}

interface SchoolsState {
  schools: School[];
  schoolMap: Record<number, School>;
  loading: boolean;
  fetchSchools: () => Promise<void>;
  fetchSchoolById: (id: number) => Promise<School | null>;
}

export const useSchoolsStore = create<SchoolsState>((set, get) => ({
  schools: [],
  schoolMap: {},
  loading: false,

  fetchSchools: async () => {
    set({ loading: true });
    try {
      const { data } = await apiGetSchools();
      const map: Record<number, School> = {};
      data.forEach((s: School) => (map[s.id] = s));
      set({ schools: data, schoolMap: map, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchSchoolById: async (id: number) => {
    const cached = get().schoolMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const school = await apiGetSchoolById(id);
      set(state => ({ schoolMap: { ...state.schoolMap, [id]: school }, loading: false }));
      return school;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  }
}));
