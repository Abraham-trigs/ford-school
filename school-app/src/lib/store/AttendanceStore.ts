// "use client";
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import type { Attendance } from "@/types/school";

// interface AttendanceStore {
//   attendanceMap: Record<string, Attendance>; // singular
//   attendanceIds: string[];
//   attendanceLoading: boolean; // singular

//   fetchAttendance: () => Promise<void>;
//   addAttendance: (record: Omit<Attendance, "id" | "createdAt">) => Promise<void>;
//   updateAttendance: (id: string, data: Partial<Attendance>) => Promise<void>;
//   deleteAttendance: (id: string) => Promise<void>;

//   getAttendanceByDate: (date: string) => Attendance[];
//   getLatestAttendanceDate: () => string | null;
// }

// export const useAttendanceStore = create<AttendanceStore>()(
//   persist(
//     (set, get) => ({
//       attendanceMap: {},
//       attendanceIds: [],
//       attendanceLoading: false,

//       fetchAttendance: async () => {
//         set({ attendanceLoading: true });
//         try {
//           const res = await fetch("/api/attendance"); // API returns multiple
//           if (!res.ok) throw new Error("Failed to fetch attendance");
//           const data: Attendance[] = await res.json();

//           const attendanceMap: Record<string, Attendance> = {};
//           const attendanceIds: string[] = [];
//           data.forEach((a) => {
//             attendanceMap[a.id] = a;
//             attendanceIds.push(a.id);
//           });

//           set({ attendanceMap, attendanceIds });
//         } catch (err) {
//           console.error("fetchAttendance error:", err);
//         } finally {
//           set({ attendanceLoading: false });
//         }
//       },

//       addAttendance: async (record) => {
//         try {
//           const res = await fetch("/api/attendance", {
//             method: "POST",
//             body: JSON.stringify(record),
//             headers: { "Content-Type": "application/json" },
//           });
//           if (!res.ok) throw new Error("Failed to add attendance");
//           const newRecord: Attendance = await res.json();
//           set((state) => ({
//             attendanceMap: { ...state.attendanceMap, [newRecord.id]: newRecord },
//             attendanceIds: [...state.attendanceIds, newRecord.id],
//           }));
//         } catch (err) {
//           console.error("addAttendance error:", err);
//         }
//       },

//       updateAttendance: async (id, data) => {
//         try {
//           const res = await fetch(`/api/attendance/${id}`, {
//             method: "PUT",
//             body: JSON.stringify(data),
//             headers: { "Content-Type": "application/json" },
//           });
//           if (!res.ok) throw new Error("Failed to update attendance");
//           const updated: Attendance = await res.json();
//           set((state) => ({ attendanceMap: { ...state.attendanceMap, [id]: updated } }));
//         } catch (err) {
//           console.error("updateAttendance error:", err);
//         }
//       },

//       deleteAttendance: async (id) => {
//         try {
//           const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
//           if (!res.ok) throw new Error("Failed to delete attendance");
//           set((state) => {
//             const { [id]: _, ...attendanceMap } = state.attendanceMap;
//             return { attendanceMap, attendanceIds: state.attendanceIds.filter((aid) => aid !== id) };
//           });
//         } catch (err) {
//           console.error("deleteAttendance error:", err);
//         }
//       },

//       getAttendanceByDate: (date) =>
//         get().attendanceIds.map((id) => get().attendanceMap[id])
//           .filter((a) => a.date.split("T")[0] === date),

//       getLatestAttendanceDate: () => {
//         if (!get().attendanceIds.length) return null;
//         const dates = get().attendanceIds
//           .map((id) => get().attendanceMap[id].date.split("T")[0])
//           .sort();
//         return dates[dates.length - 1];
//       },
//     }),
//     { name: "attendance-store", getStorage: () => localStorage }
//   )
// );
