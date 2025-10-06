"use client";

import { useState, KeyboardEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";
import LoaderModal from "@/components/layout/LoaderModal";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuthStore();
  const { loading } = useSessionStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (localLoading || loading) return;
    setLocalLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Logged in successfully!");
      setPassword("");
      // ✅ Redirect handled automatically in sessionStore
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  if (localLoading || loading)
    return <LoaderModal isVisible text="Logging in..." />;

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
            onChange={(e) => setEmail(e.target.value.trimStart())}
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
            disabled={localLoading || loading}
            className="w-full px-6 py-3 bg-accentTeal text-secondary rounded-lg font-semibold hover:bg-accentPurple transition-colors duration-300 disabled:opacity-50"
          >
            Login
          </button>
        </div>
      </main>
    </>
  );
}
