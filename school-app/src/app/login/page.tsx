"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { motion, Variants, easeOut } from "framer-motion";
import LoginButton from "@/components/LoginButton";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { login, user, loggedIn, loading } = useSessionStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && loggedIn && user) {
      redirectAfterLogin(user.role);
    }
  }, [loggedIn, loading, user]);

  const redirectAfterLogin = (role: string) => {
    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }

    const roleLower = role.toLowerCase();
    const defaultDashboard = `/${roleLower}/dashboard`;
    router.replace(defaultDashboard);
  };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      await login(email, password);

      const { loggedIn: newLoggedIn, user: newUser } =
        useSessionStore.getState();

      if (newLoggedIn && newUser) redirectAfterLogin(newUser.role);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    }
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-back">
      <motion.div
        className="w-full max-w-md p-8 bg-light rounded-lg shadow-md"
        initial={{ opacity: 0, y: -30 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: easeOut },
        }}
      >
        <h2 className="text-2xl font-display mb-6 text-wine text-center font-bold">
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
            className="w-full px-4 py-2 border border-wine rounded focus:outline-none focus:ring-2 focus:ring-wine"
            variants={itemVariants}
          />

          <motion.div className="relative" variants={itemVariants}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-wine rounded focus:outline-none focus:ring-2 focus:ring-wine"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-wine hover:text-light transition-colors"
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
