import { create } from "zustand";
import { apiGetResources, apiGetResourceById } from "@/lib/api/resources";

export interface Resource {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  deletedAt?: string | null;
  purchases?: any[];
  [key: string]: any;
}

interface ResourcesState {
  resources: Resource[];
  resourceMap: Record<number, Resource>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: { name?: string };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ name: string }>) => void;

  fetchResources: () => Promise<void>;
  fetchResourceById: (id: number) => Promise<Resource | null>;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
  resources: [],
  resourceMap: {},
  loading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  filter: {},

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setFilter: (filter) => set({ filter }),

  fetchResources: async () => {
    const { page, pageSize, filter } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetResources({
        page,
        pageSize,
        name: filter.name,
      });

      const map: Record<number, Resource> = {};
      data.forEach((r: Resource) => (map[r.id] = r));

      set({
        resources: data,
        resourceMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchResourceById: async (id: number) => {
    const cached = get().resourceMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const resource = await apiGetResourceById(id);
      set(state => ({
        resourceMap: { ...state.resourceMap, [id]: resource },
        loading: false,
      }));
      return resource;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
