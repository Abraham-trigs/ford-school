// "use client";

// import { useEffect, useState } from "react";
// import { useAttendanceStore } from "@/lib/store/attendanceStore";
// import type { Attendance } from "@/types/users";

// const colors = {
//   wine: "#72040e",
//   light: "#920055",
//   back: "#dee4ea",
//   switch: "#eee6e6",
// };

// const PAGE_SIZE = 30;

// export default function AttendancePage() {
//   const fetchAttendance = useAttendanceStore((state) => state.fetchAttendance);
//   const attendancesMap = useAttendanceStore((state) => state.attendancesMap);
//   const attendanceIds = useAttendanceStore((state) => state.attendanceIds);

//   const [loading, setLoading] = useState(true);
//   const [currentDate, setCurrentDate] = useState<string>("");
//   const [earliestDate, setEarliestDate] = useState<string>("");
//   const [latestDate, setLatestDate] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState<number>(1);

//   // Load attendance
//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       await fetchAttendance();
//       setLoading(false);
//     };
//     load();
//   }, [fetchAttendance]);

//   // Compute earliestDate, latestDate, currentDate
//   useEffect(() => {
//     if (!attendanceIds.length) {
//       const today = new Date().toISOString().split("T")[0];
//       setCurrentDate(today);
//       setEarliestDate(today);
//       setLatestDate(today);
//       return;
//     }

//     const dates = attendanceIds
//       .map((id) => attendancesMap[id].date.split("T")[0])
//       .sort(); // ascending

//     const today = new Date().toISOString().split("T")[0];
//     const hasToday = dates.includes(today);

//     setEarliestDate(dates[0]);
//     setLatestDate(dates[dates.length - 1]);
//     setCurrentDate(hasToday ? today : dates[dates.length - 1]);
//     setCurrentPage(1);
//   }, [attendanceIds, attendancesMap]);

//   const filteredAttendances = attendanceIds
//     .map((id) => attendancesMap[id])
//     .filter((a) => a.date.split("T")[0] === currentDate);

//   const totalPages = Math.ceil(filteredAttendances.length / PAGE_SIZE);
//   const pagedAttendances = filteredAttendances.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );

//   // Day navigation
//   const handlePrevDay = () => {
//     const prev = new Date(currentDate);
//     prev.setDate(prev.getDate() - 1);
//     const prevDate = prev.toISOString().split("T")[0];
//     if (prevDate >= earliestDate) {
//       setCurrentDate(prevDate);
//       setCurrentPage(1);
//     }
//   };

//   const handleNextDay = () => {
//     const next = new Date(currentDate);
//     next.setDate(next.getDate() + 1);
//     const nextDate = next.toISOString().split("T")[0];
//     if (nextDate <= latestDate) {
//       setCurrentDate(nextDate);
//       setCurrentPage(1);
//     }
//   };

//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCurrentDate(e.target.value);
//     setCurrentPage(1);
//   };

//   // Pagination
//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((p) => p - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((p) => p + 1);
//   };

//   if (loading)
//     return (
//       <p className="text-lg" style={{ color: colors.wine }}>
//         Loading attendance...
//       </p>
//     );

//   return (
//     <div
//       className="p-6 overflow-x-auto"
//       style={{ backgroundColor: colors.back }}
//     >
//       <h1 className="text-2xl font-bold mb-4" style={{ color: colors.wine }}>
//         Attendance Records
//       </h1>

//       <div className="flex gap-2 mb-4 items-center flex-wrap">
//         <button
//           className="px-3 py-1 rounded"
//           style={{
//             backgroundColor:
//               currentDate <= earliestDate ? colors.switch : colors.light,
//             color: currentDate <= earliestDate ? colors.wine : colors.back,
//             cursor: currentDate <= earliestDate ? "not-allowed" : "pointer",
//           }}
//           onClick={handlePrevDay}
//           disabled={currentDate <= earliestDate}
//         >
//           Previous Day
//         </button>

//         <input
//           type="date"
//           value={currentDate}
//           min={earliestDate}
//           max={latestDate}
//           onChange={handleDateChange}
//           className="p-1 rounded border"
//           style={{
//             borderColor: colors.light,
//             backgroundColor: colors.switch,
//             color: colors.wine,
//           }}
//         />

//         <button
//           className="px-3 py-1 rounded"
//           style={{
//             backgroundColor:
//               currentDate >= latestDate ? colors.switch : colors.light,
//             color: currentDate >= latestDate ? colors.wine : colors.back,
//             cursor: currentDate >= latestDate ? "not-allowed" : "pointer",
//           }}
//           onClick={handleNextDay}
//           disabled={currentDate >= latestDate}
//         >
//           Next Day
//         </button>
//       </div>

//       {filteredAttendances.length === 0 ? (
//         <p className="text-lg" style={{ color: colors.wine }}>
//           No attendance records found for {currentDate}.
//         </p>
//       ) : (
//         <>
//           <table
//             className="min-w-full border border-collapse"
//             style={{ borderColor: colors.light }}
//           >
//             <thead
//               className="sticky top-0"
//               style={{ backgroundColor: colors.switch, zIndex: 10 }}
//             >
//               <tr>
//                 <th
//                   className="p-2 border-b text-left"
//                   style={{ borderColor: colors.light, color: colors.wine }}
//                 >
//                   Student Name
//                 </th>
//                 <th
//                   className="p-2 border-b text-left"
//                   style={{ borderColor: colors.light, color: colors.wine }}
//                 >
//                   Class
//                 </th>
//                 <th
//                   className="p-2 border-b text-left"
//                   style={{ borderColor: colors.light, color: colors.wine }}
//                 >
//                   Date
//                 </th>
//                 <th
//                   className="p-2 border-b text-left"
//                   style={{ borderColor: colors.light, color: colors.wine }}
//                 >
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {pagedAttendances.map((a, idx) => (
//                 <tr
//                   key={a.id}
//                   className="transition-colors duration-200 cursor-pointer"
//                   style={{
//                     backgroundColor:
//                       idx % 2 === 0 ? colors.back : colors.switch,
//                   }}
//                   onMouseEnter={(e) => {
//                     (
//                       e.currentTarget as HTMLTableRowElement
//                     ).style.backgroundColor = colors.light;
//                     (e.currentTarget as HTMLTableRowElement).style.color =
//                       colors.back;
//                   }}
//                   onMouseLeave={(e) => {
//                     (
//                       e.currentTarget as HTMLTableRowElement
//                     ).style.backgroundColor =
//                       idx % 2 === 0 ? colors.back : colors.switch;
//                     (e.currentTarget as HTMLTableRowElement).style.color =
//                       colors.wine;
//                   }}
//                 >
//                   <td
//                     className="p-2 border-b"
//                     style={{ borderColor: colors.light }}
//                   >
//                     {a.student.name}
//                   </td>
//                   <td
//                     className="p-2 border-b"
//                     style={{ borderColor: colors.light }}
//                   >
//                     {a.class.name}
//                   </td>
//                   <td
//                     className="p-2 border-b"
//                     style={{ borderColor: colors.light }}
//                   >
//                     {new Date(a.date).toLocaleDateString()}
//                   </td>
//                   <td
//                     className="p-2 border-b"
//                     style={{ borderColor: colors.light }}
//                   >
//                     {a.status}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="flex gap-2 justify-center mt-2">
//             <button
//               className="px-3 py-1 rounded"
//               style={{
//                 backgroundColor:
//                   currentPage === 1 ? colors.switch : colors.light,
//                 color: currentPage === 1 ? colors.wine : colors.back,
//                 cursor: currentPage === 1 ? "not-allowed" : "pointer",
//               }}
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//             >
//               Previous Page
//             </button>

//             <span style={{ color: colors.wine, alignSelf: "center" }}>
//               Page {currentPage} of {totalPages || 1}
//             </span>

//             <button
//               className="px-3 py-1 rounded"
//               style={{
//                 backgroundColor:
//                   currentPage === totalPages ? colors.switch : colors.light,
//                 color: currentPage === totalPages ? colors.wine : colors.back,
//                 cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//               }}
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//             >
//               Next Page
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
