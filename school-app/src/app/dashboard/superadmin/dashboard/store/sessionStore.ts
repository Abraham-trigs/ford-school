// // store/sessionStore.ts
// import { create } from "zustand";

// interface SessionState {
//   accessToken: string | null;
//   setAccessToken: (token: string) => void;
//   clearSession: () => void;
// }

// export const useSessionStore = create<SessionState>((set) => ({
//   accessToken: null,
//   setAccessToken: (token) => set({ accessToken: token }),
//   clearSession: () => set({ accessToken: null }),
// }));
