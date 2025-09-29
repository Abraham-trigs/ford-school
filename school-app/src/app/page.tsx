// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <main className="w-screen h-screen bg-secondary flex items-center justify-center">
      {/* Parent container: deepPurple */}
      <div className="bg-deepPurple p-8 rounded-lg w-full max-w-md text-center shadow-lg">
        {/* Child text uses secondary for contrast */}
        <h1 className="text-6xl font-display font-bold text-secondary mb-4">
          Astir
        </h1>
        <p className="text-secondary text-lg mb-6">
          Welcome to your School Management System
        </p>

        {/* Button using parent-child pattern */}
        <button
          onClick={handleLogin}
          className="px-8 py-3 bg-secondary text-deepPurple rounded-lg shadow-md hover:bg-accentTeal hover:text-secondary transition-colors duration-300 font-semibold"
        >
          Login
        </button>
      </div>
    </main>
  );
}
