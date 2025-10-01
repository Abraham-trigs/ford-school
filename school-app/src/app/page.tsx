"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="w-screen h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-thin text-lightGrey mb-12">.Astir</h1>

      <div className="bg-deepPurple p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-display font-bold text-secondary mb-6">
          Welcome
        </h2>

        <p className="text-lightGray mb-8">
          Select your login type to continue
        </p>

        <div className="flex flex-col gap-4">
          {/* SuperAdmin Login */}
          <button
            onClick={() => router.push("/login/superadmin")}
            className="w-full px-6 py-3  text-secondary rounded-lg font-semibold hover:bg-accentPurple transition-colors duration-300"
          >
            Login as SuperAdmin
          </button>

          {/* User / Staff Login */}
          <button
            onClick={() => router.push("/login/user")}
            className="w-full px-6 py-3 bg-accentPurple text-secondary rounded-lg font-semibold hover:bg-accentTeal transition-colors duration-300"
          >
            Login as User / Staff
          </button>
        </div>
      </div>
    </main>
  );
}
