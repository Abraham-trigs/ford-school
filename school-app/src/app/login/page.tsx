"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import LoaderModal from "@/components/layout/LoaderModal";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useRedirectOnAuth } from "@/lib/hooks/RedirectOnAuth";

export default function LoginPage() {
  const {
    loading: authLoading,
    hydrate,
    login,
  } = useAuthStore((state) => ({
    loading: state.loading,
    hydrate: state.hydrate,
    login: state.login,
  }));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useRedirectOnAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  if (loading || authLoading) {
    return <LoaderModal isVisible text="Logging in..." />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <main className="w-screen h-screen bg-secondary flex flex-col items-center justify-center px-4">
        <h1 className="text-8xl font-thin text-lightGrey mb-12">.Astire</h1>
        <div className="bg-deepPurple p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-display font-bold text-secondary mb-6">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 bg-secondary text-lightGray rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accentPurple"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="relative w-full mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-secondary text-lightGray rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accentPurple pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-lightGray hover:text-accentTeal"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={authLoading || loading}
            className="w-full px-6 py-3 bg-accentTeal text-secondary rounded-lg font-semibold hover:bg-accentPurple transition-colors duration-300 disabled:opacity-50"
          >
            Login
          </button>
        </div>
      </main>
    </>
  );
}
