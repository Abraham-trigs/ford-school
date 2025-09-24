// "use client";

// interface StatCardProps {
//   title: string;
//   value: number | string;
// }

// function StatCard({ title, value }: StatCardProps) {
//   return (
//     <div className="bg-surface p-4 rounded shadow flex flex-col items-center">
//       <p className="text-textSecondary">{title}</p>
//       <p className="text-2xl font-bold">{value}</p>
//     </div>
//   );
// }

// export default function TeacherStats() {
//   // Example static data
//   const stats = [
//     { title: "Classes Today", value: 3 },
//     { title: "Pending Assignments", value: 5 },
//     { title: "Grading Tasks", value: 2 },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//       {stats.map((s) => (
//         <StatCard key={s.title} {...s} />
//       ))}
//     </div>
//   );
// }
