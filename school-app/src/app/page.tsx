"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/lib/store/sessionStore";
import NavigateToLoginButton from "@/components/NavigateToLoginButton";

export default function Home() {
  const { fetchSession, loggedIn, user } = useSessionStore();

  // rehydrate session on entry
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return (
    <>
      <h1 className="text-wine font-display text-4xl">Welcome</h1>
      <p className="text-light font-sans">This is the homepage</p>

      <button className="bg-wine text-switch px-4 py-2 rounded">
        Get Started
      </button>

      {loggedIn ? (
        <p className="mt-4 text-green-500">
          Logged in as <strong>{user?.name || user?.email}</strong>
        </p>
      ) : (
        <NavigateToLoginButton />
      )}
    </>
  );
}
