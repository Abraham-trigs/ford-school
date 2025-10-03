"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSuperAdminStore } from "@/app/dashboard/superadmin/dashboard/store/superAdminStore";
import { Eye, EyeOff } from "lucide-react";
import LoaderModal from "@/app/dashboard/superadmin/dashboard/components/LoaderModal";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { setSuperAdmin } = useSuperAdminStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // initial refresh
  const [authLoading, setAuthLoading] = useState(false);

  // ✅ One-time session refresh check
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const refreshToken = localStorage.getItem("superAdminRefreshToken");
        if (!refreshToken) return setLoading(false);

        const res = await fetch("/api/auth/superadmin/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          setSuperAdmin(data.superAdmin, data.accessToken);
          router.replace("/dashboard/superadmin/dashboard");
        } else {
          localStorage.removeItem("superAdminRefreshToken");
        }
      } catch (err) {
        console.error("Session refresh failed", err);
      } finally {
        setLoading(false);
      }
    };

    refreshSession();
  }, [router, setSuperAdmin]);

  // ✅ Handle login
  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Save in-memory
      setSuperAdmin(data.superAdmin, data.accessToken);

      // ✅ Persist refresh token
      localStorage.setItem("superAdminRefreshToken", data.refreshToken);

      router.replace("/dashboard/superadmin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  // ✅ LoaderModal for both initial session check & auth loading
  if (loading || authLoading) {
    return <LoaderModal isVisible text="Logging in..." />;
  }

  return (
    <main className="w-screen h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-thin text-lightGrey mb-12">.Astire</h1>

      <div className="bg-deepPurple p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-display font-bold text-secondary mb-6">
          SuperAdmin Login
        </h2>

        {error && <p className="text-errorPink mb-4 font-semibold">{error}</p>}

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
          disabled={authLoading}
          className="w-full px-6 py-3 bg-accentTeal text-secondary rounded-lg font-semibold hover:bg-accentPurple transition-colors duration-300 disabled:opacity-50"
        >
          Login
        </button>
      </div>
    </main>
  );
}
