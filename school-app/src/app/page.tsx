"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-thin text-lightGrey mb-12">.Astir</h1>

      <div className="bg-purple p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-display font-bold text-secondary mb-6">
          Welcome
        </h2>

        <div className="flex flex-col gap-4">
          {/* SuperAdmin Login */}
          <button
            onClick={() => router.push("/login")}
            className=" hover:bg-accentPurple bg-deeper w-full px-6 py-3  text-lightGray rounded-lg font-semibold  transition-colors duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
