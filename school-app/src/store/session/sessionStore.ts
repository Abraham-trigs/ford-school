// lib/session/sessionStore.ts

export interface Session {
  token: string;            // refresh token
  userId: number;           // superadmin/user/teacher id
  role: string;             // SUPERADMIN, USER, TEACHER...
  expiresAt: Date;          // expiry timestamp
  metadata?: Record<string, any>; // ip, userAgent, etc.
}

export interface SessionStore {
  create(session: Session): Promise<void>;
  get(token: string): Promise<Session | null>;
  delete(token: string): Promise<void>;
  refresh(token: string, newExpiry: Date): Promise<Session | null>;
}
