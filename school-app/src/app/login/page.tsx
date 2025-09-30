"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"superadmin" | "user">("superadmin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        role === "superadmin"
          ? "/api/auth/superadmin/login"
          : "/api/auth/user/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-screen h-screen bg-secondary flex flex-col items-center justify-center px-4">
      {/* ASTIR title */}
      <h1 className="text-8xl font-thin text-lightGrey mb-12">.Astire</h1>

      {/* Login box */}
      <div className="bg-deepPurple p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-display font-bold text-secondary mb-6">
          Login
        </h2>

        {/* Role switcher */}
        <div className="flex justify-center mb-6 bg-accentPurple/20 rounded-full p-1">
          {["superadmin", "user"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r as "superadmin" | "user")}
              className={`px-6 py-2 rounded-full transition-colors duration-300 font-semibold ${
                role === r
                  ? "bg-accentTeal text-secondary shadow-lg"
                  : "bg-transparent text-lightGray hover:bg-accentPurple/50"
              }`}
            >
              {r === "superadmin" ? "SuperAdmin" : "User / Staff"}
            </button>
          ))}
        </div>

        {error && <p className="text-errorPink mb-4 font-semibold">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 bg-secondary text-lightGray rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accentPurple"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 bg-secondary text-lightGray rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accentPurple"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-6 py-3 bg-accentTeal text-secondary rounded-lg font-semibold hover:bg-accentPurple transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
