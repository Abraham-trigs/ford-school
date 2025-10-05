// store/authStore.ts
import { useSessionStore } from "./sessionStore";

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = (): AuthActions => {
  const { setToken, clearSession, refreshProfile } = useSessionStore.getState();

  return {
    login: async (email: string, password: string) => {
      if (!email || !password) throw new Error("Email and password are required");

      try {
        const res = await fetch("/api/sessions/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // ensures cookies are sent
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        setToken(data.token);         // save JWT
        await refreshProfile();       // fetch user profile
      } catch (err: any) {
        console.error("Login error:", err.message || err);
        throw err;
      }
    },

    logout: () => clearSession(),
  };
};
