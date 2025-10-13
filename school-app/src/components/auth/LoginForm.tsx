"use client";

import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import RequestID from "@/components/common/RequestID";

export default function LoginForm() {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null); // store logged-in user temporarily

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password }, // removed schoolId
        { withCredentials: true } // keeps refresh token cookie
      );

      // store user in Zustand
      setUser(res.data.user);

      // simple role-based redirect
      const role = res.data.user.role;
      if (role === "ADMIN" || role === "PRINCIPAL") {
        router.push("/dashboard/admin");
      } else {
        // Directly set Super Admin and redirect
        setUser(user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = (schoolId: string) => {
    if (!pendingUser) return;

    // Merge schoolId into user object for front-end purposes
    const updatedUser = { ...pendingUser, schoolId };
    setUser(updatedUser);
    setShowModal(false);
    router.push("/dashboard");
  };

  return (
    <>
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
          className="w-full p-3 mb-6 rounded bg-background border border-muted focus:outline-none focus:ring-2 focus:ring-primary text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      {/* RequestID modal for non-Super Admin users */}
      <RequestID
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}
