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
      try {
        const res = await fetch("/api/sessions/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Login failed");
        }

        const { token } = await res.json();
        setToken(token);
        await refreshProfile();
      } catch (err: any) {
        throw err;
      }
    },

    logout: () => clearSession(),
  };
};
