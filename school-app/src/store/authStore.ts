"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "./sessionStore";

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = (): AuthActions => {
  const router = useRouter();
  const { setToken, clearSession, refreshProfile } = useSessionStore.getState();

  return {
    login: async (email: string, password: string) => {
      if (!email || !password) throw new Error("Email and password are required");

      try {
        const res = await fetch("/api/sessions/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // include cookies
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        // ✅ Save token and refresh profile
        setToken(data.token);
        const profile = await refreshProfile();

        // 🧠 Debug: verify fetched data
        console.log("✅ Login successful — fetched profile:", profile);

        const role = profile?.roles?.[0];
        console.log("🧩 Detected role:", role);

        // ✅ Redirect by role
        if (role === "SUPERADMIN") router.push("dashboard/superadmin/dashboard");
        else if (role === "TEACHER") router.push("dashboard/teacher/dashboard");
        else if (role === "STUDENT") router.push("dashboard/student/dashboard");
        else if (role === "PARENT") router.push("dashboard/parent/dashboard");
        else console.warn("⚠️ Unknown role, staying on same page");
      } catch (err: any) {
        console.error("❌ Login error:", err.message || err);
        throw err;
      }
    },

    logout: () => clearSession(),
  };
};
