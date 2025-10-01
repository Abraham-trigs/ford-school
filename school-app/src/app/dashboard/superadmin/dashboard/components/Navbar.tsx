// app/dashboard/components/Navbar.tsx
"use client";

export default function Navbar() {
  return (
    <header className="bg-secondary p-4 flex justify-between items-center shadow-md">
      <h1 className="text-deepPurple font-display font-bold text-xl">
        Dashboard
      </h1>
      <button className="bg-accentTeal text-deepPurple px-4 py-2 rounded-lg hover:bg-accentPurple transition-colors duration-300">
        Logout
      </button>
    </header>
  );
}
