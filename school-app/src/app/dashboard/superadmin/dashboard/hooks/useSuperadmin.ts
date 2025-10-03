// hooks/useSuperAdmin.ts
import { useEffect } from "react";
import { useSessionDataStore } from "@/store/sessionDataStore";

export const useSuperAdmin = () => {
  const { userData, token, fetchUserData, setToken, clearUserData } =
    useSessionDataStore((state) => ({
      userData: state.userData,
      token: state.token,
      fetchUserData: state.fetchUserData,
      setToken: state.setToken,
      clearUserData: state.clearUserData,
    }));

  // Auto-fetch user data whenever token changes
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token, fetchUserData]);

  return { userData, token, setToken, clearUserData };
};
