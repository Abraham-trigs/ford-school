import { create } from "zustand";
import { apiGetTransport, apiGetTransportById } from "@/lib/api/transport";

export interface Transport {
  id: number;
  routeName: string;
  vehicleNumber: string;
  driverId: number;
  schoolSessionId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  driver?: {
    id: number;
    fullName: string;
    email?: string;
  };
  [key: string]: any;
}

interface TransportState {
  transportList: Transport[];
  transportMap: Record<number, Transport>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: {
    routeName?: string;
    vehicleNumber?: string;
    driverId?: number;
    schoolSessionId?: number;
  };
  sort: { field: "createdAt" | "routeName" | "vehicleNumber"; direction: "asc" | "desc" };

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<{ routeName: string; vehicleNumber: string; driverId: number; schoolSessionId: number }>) => void;
  setSort: (sort: { field: "createdAt" | "routeName" | "vehicleNumber"; direction: "asc" | "desc" }) => void;

  fetchTransport: () => Promise<void>;
  fetchTransportById: (id: number) => Promise<Transport | null>;
}

export const useTransportStore = create<TransportState>((set, get) => ({
  transportList: [],
  transportMap: {},
  loading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  filter: {},
  sort: { field: "createdAt", direction: "desc" },

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),

  fetchTransport: async () => {
    const { page, pageSize, filter, sort } = get();
    set({ loading: true });
    try {
      const { data, meta } = await apiGetTransport({
        page,
        pageSize,
        routeName: filter.routeName,
        vehicleNumber: filter.vehicleNumber,
        driverId: filter.driverId,
        schoolSessionId: filter.schoolSessionId,
        sortField: sort.field,
        sortDirection: sort.direction,
      });

      const map: Record<number, Transport> = {};
      data.forEach((t: Transport) => (map[t.id] = t));

      set({
        transportList: data,
        transportMap: map,
        total: meta.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchTransportById: async (id: number) => {
    const cached = get().transportMap[id];
    if (cached) return cached;

    set({ loading: true });
    try {
      const transport = await apiGetTransportById(id);
      set(state => ({
        transportMap: { ...state.transportMap, [id]: transport },
        loading: false,
      }));
      return transport;
    } catch (err) {
      console.error(err);
      set({ loading: false });
      return null;
    }
  },
}));
