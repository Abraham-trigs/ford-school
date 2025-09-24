// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useRef } from "react";

// const links = [
//   { name: "Dashboard", href: "/teacher" },
//   { name: "Attendance", href: "/teacher/attendance" },
//   { name: "Class", href: "/teacher/class" },
//   { name: "Assignments", href: "/teacher/assignments" },
//   { name: "Grades", href: "/teacher/grades" },
//   { name: "Messages", href: "/teacher/messages" },
//   { name: "Timetable", href: "/teacher/timetable" },
// ];

// interface SidebarProps {
//   isOpen?: boolean;
//   onClose?: () => void;
//   mode?: "desktop" | "mobile";
// }

// export default function Sidebar({
//   isOpen = true,
//   onClose,
//   mode = "desktop",
// }: SidebarProps) {
//   const pathname = usePathname();
//   const sidebarRef = useRef<HTMLDivElement>(null);

//   // Close sidebar when clicking outside (mobile only)
//   useEffect(() => {
//     if (mode !== "mobile" || !isOpen) return;

//     function handleClickOutside(event: MouseEvent) {
//       if (
//         sidebarRef.current &&
//         !sidebarRef.current.contains(event.target as Node)
//       ) {
//         onClose?.();
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isOpen, mode, onClose]);

//   if (mode === "desktop") {
//     return (
//       <aside className="hidden md:flex flex-col w-64 bg-wine text-back h-screen p-4 border-r border-light sticky top-0">
//         <h1 className="text-xl font-bold mb-6">Teacher Panel</h1>
//         <nav className="flex flex-col gap-3">
//           {links.map((link) => (
//             <Link
//               key={link.href}
//               href={link.href}
//               className={`p-2 rounded transition ${
//                 pathname === link.href
//                   ? "bg-light text-back"
//                   : "hover:bg-light hover:text-back"
//               }`}
//             >
//               {link.name}
//             </Link>
//           ))}
//         </nav>
//       </aside>
//     );
//   }

//   // --- Mobile Sidebar ---
//   return (
//     <div
//       ref={sidebarRef}
//       className={`md:hidden absolute right-4 top-16 z-40 w-56 bg-wine border border-light rounded shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform origin-top ${
//         isOpen
//           ? "max-h-[1000px] p-4 scale-y-100 opacity-100"
//           : "max-h-0 p-0 scale-y-95 opacity-0"
//       }`}
//     >
//       <nav className="flex flex-col gap-3">
//         {links.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className={`p-2 rounded transition ${
//               pathname === link.href
//                 ? "bg-light text-back"
//                 : "hover:bg-light hover:text-back"
//             }`}
//             onClick={onClose}
//           >
//             {link.name}
//           </Link>
//         ))}
//       </nav>
//     </div>
//   );
// }
