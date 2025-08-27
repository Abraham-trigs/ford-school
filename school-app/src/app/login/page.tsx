"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { motion } from "framer-motion";
import LoginButton from "@/components/LoginButton";

interface SessionResponse {
  loggedIn: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Call login API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      // Step 2: Confirm session
      const sessionRes = await fetch("/api/auth/session");
      const sessionData: SessionResponse = await sessionRes.json();

      if (sessionData.loggedIn && sessionData.user) {
        // Step 3: Role-based redirect
        switch (sessionData.user.role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "TEACHER":
            router.push("/teacher");
            break;
          case "STUDENT":
            router.push("/student");
            break;
          case "PARENT":
            router.push("/parent");
            break;
          case "HEADMASTER":
            router.push("/headmaster");
            break;
          case "PROPRIETOR":
            router.push("/proprietor");
            break;
          default:
            router.push("/login"); // fallback
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-back">
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
        initial={{ opacity: 0, y: -30 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        }}
      >
        <h2 className="text-2xl font-display mb-6 text-wine text-center">
          Ford School Login
        </h2>

        {error && (
          <motion.div
            className="bg-red-100 text-red-700 p-2 mb-4 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
          >
            {error}
          </motion.div>
        )}

        <motion.div
          className="flex flex-col gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-wine"
            variants={itemVariants}
          />

          <motion.div className="relative" variants={itemVariants}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-wine"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-wine transition-colors"
            >
              {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <LoginButton onClick={handleLogin} isLoading={loading} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
