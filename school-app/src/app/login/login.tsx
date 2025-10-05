"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoaderModal from "@/components/layout/LoaderModal";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    hydrate,
    user,
    loading: authLoading,
  } = useAuthStore((state) => ({
    login: state.login,
    hydrate: state.hydrate,
    user: state.user,
    loading: state.loading,
  }));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hydrate authStore on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.roles.includes("SUPERADMIN"))
        router.replace("/dashboard/superadmin/dashboard");
      else if (user.roles.includes("ADMIN"))
        router.replace("/dashboard/admin/dashboard");
      else if (user.roles.includes("TEACHER"))
        router.replace("/dashboard/teacher/dashboard");
      else router.replace("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
          Login
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
