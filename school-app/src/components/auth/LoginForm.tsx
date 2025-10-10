"use client";

import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

export default function LoginForm() {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState(""); // can be dropdown if multiple schools
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password, schoolId },
        { withCredentials: true } // important to store the refresh token cookie
      );

      // Set user in Zustand store
      setUser(res.data.user);

      // Redirect based on role (you can customize paths per role)
      const role = res.data.user.role;
      if (role === "ADMIN" || role === "PRINCIPAL") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto mt-24 p-8 bg-surface rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-display mb-6 text-primary text-center">
        FORMless Login
      </h2>

      {error && <p className="text-danger mb-4">{error}</p>}

      <label className="block mb-2 text-muted">Email</label>
      <input
        type="email"
        className="w-full p-3 mb-4 rounded bg-background border border-muted focus:outline-none focus:ring-2 focus:ring-primary text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label className="block mb-2 text-muted">Password</label>
      <input
        type="password"
        className="w-full p-3 mb-4 rounded bg-background border border-muted focus:outline-none focus:ring-2 focus:ring-primary text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label className="block mb-2 text-muted">School ID</label>
      <input
        type="text"
        className="w-full p-3 mb-6 rounded bg-background border border-muted focus:outline-none focus:ring-2 focus:ring-secondary text-white"
        value={schoolId}
        onChange={(e) => setSchoolId(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full p-3 bg-primary hover:bg-purpleBright text-background font-semibold rounded transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </motion.form>
  );
}
