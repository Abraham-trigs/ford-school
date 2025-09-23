// "use client";

// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import type { Class } from "@/types/school";

// interface ClassStore {
//   classMap: Record<string, Class>;  // singular
//   classIds: string[];
//   classLoading: boolean;

//   // ---------------- Fetch ----------------
//   fetchClass: () => Promise<void>;            // singular in store
//   fetchTeacherClass: (teacherId: string) => Promise<void>; // singular

//   // ---------------- CRUD ----------------
//   addClass: (cls: Omit<Class, "id" | "createdAt" | "updatedAt">) => Promise<void>;
//   updateClass: (id: string, data: Partial<Class>) => Promise<void>;
//   deleteClass: (id: string) => Promise<void>;
// }

// export const useClassStore = create<ClassStore>()(
//   persist(
//     (set, get) => ({
//       classMap: {},
//       classIds: [],
//       classLoading: false,

//       // ---------------- Fetch ----------------
//       // Note: API returns multiple classes, but store remains singular (classMap)
//       fetchClass: async () => {
//         set({ classLoading: true });
//         try {
//           const res = await fetch("/api/class"); // API can return array
//           if (!res.ok) throw new Error("Failed to fetch class");
//           const data: Class[] = await res.json();

//           const classMap: Record<string, Class> = {};
//           const classIds: string[] = [];
//           data.forEach((c) => {
//             classMap[c.id] = c;
//             classIds.push(c.id);
//           });

//           set({ classMap, classIds });
//         } catch (err) {
//           console.error("fetchClass error:", err);
//         } finally {
//           set({ classLoading: false });
//         }
//       },

//       fetchTeacherClass: async (teacherId) => {
//         set({ classLoading: true });
//         try {
//           const res = await fetch(`/api/class?teacherId=${teacherId}`); // API returns array
//           if (!res.ok) throw new Error("Failed to fetch teacher class");
//           const data: Class[] = await res.json();

//           const classMap: Record<string, Class> = {};
//           const classIds: string[] = [];
//           data.forEach((c) => {
//             classMap[c.id] = c;
//             classIds.push(c.id);
//           });

//           set({ classMap, classIds });
//         } catch (err) {
//           console.error("fetchTeacherClass error:", err);
//         } finally {
//           set({ classLoading: false });
//         }
//       },

//       // ---------------- CRUD ----------------
//       addClass: async (cls) => {
//         try {
//           const res = await fetch("/api/class", {
//             method: "POST",
//             body: JSON.stringify(cls),
//             headers: { "Content-Type": "application/json" },
//           });
//           if (!res.ok) throw new Error("Failed to add class");
//           const newClass: Class = await res.json();
//           set((state) => ({
//             classMap: { ...state.classMap, [newClass.id]: newClass },
//             classIds: [...state.classIds, newClass.id],
//           }));
//         } catch (err) {
//           console.error("addClass error:", err);
//         }
//       },

//       updateClass: async (id, data) => {
//         try {
//           const res = await fetch(`/api/class/${id}`, {
//             method: "PUT",
//             body: JSON.stringify(data),
//             headers: { "Content-Type": "application/json" },
//           });
//           if (!res.ok) throw new Error("Failed to update class");
//           const updated: Class = await res.json();
//           set((state) => ({ classMap: { ...state.classMap, [id]: updated } }));
//         } catch (err) {
//           console.error("updateClass error:", err);
//         }
//       },

//       deleteClass: async (id) => {
//         try {
//           const res = await fetch(`/api/class/${id}`, { method: "DELETE" });
//           if (!res.ok) throw new Error("Failed to delete class");
//           set((state) => {
//             const { [id]: _, ...classMap } = state.classMap;
//             return { classMap, classIds: state.classIds.filter((cid) => cid !== id) };
//           });
//         } catch (err) {
//           console.error("deleteClass error:", err);
//         }
//       },
//     }),
//     { name: "class-store", getStorage: () => localStorage }
//   )
// );
