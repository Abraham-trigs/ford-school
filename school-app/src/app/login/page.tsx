"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import LoaderModal from "@/components/layout/LoaderModal";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (localLoading || authLoading) return;

    setLocalLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      setPassword("");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLocalLoading(false);
    }
  };

  if (localLoading || authLoading)
    return <LoaderModal isVisible text="Logging in..." />;

  return (
    <>
      <Toaster position="top-right" />
      <main className="w-auto h-auto bg-deeper flex flex-col items-center justify-center px-4">
        <h1 className="text-8xl font-thin text-lightGrey mb-12 pt-52">
          .Astire
        </h1>

        <div className="bg-purple p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-display font-bold text-secondary mb-6">
            Login
          </h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-4 bg-deepest text-lightGray rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accentPurple"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />

            <div className="relative w-full mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-deepest text-lightGray rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accentPurple pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              type="submit"
              disabled={localLoading || authLoading}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors duration-300
                ${
                  localLoading || authLoading
                    ? "bg-gray-500 text-secondary opacity-50 cursor-not-allowed"
                    : "bg-greener text-secondary hover:bg-accentPurple"
                }`}
            >
              {localLoading || authLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
