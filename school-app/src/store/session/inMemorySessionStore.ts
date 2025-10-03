// lib/session/inMemorySessionStore.ts
import { Session, SessionStore } from "./sessionStore";

export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, Session>();

  async create(session: Session): Promise<void> {
    this.sessions.set(session.token, session);
  }

  async get(token: string): Promise<Session | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  async delete(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async refresh(token: string, newExpiry: Date): Promise<Session | null> {
    const session = await this.get(token);
    if (!session) return null;

    session.expiresAt = newExpiry;
    this.sessions.set(token, session);
    return session;
  }
}

// singleton export → use this everywhere in APIs
export const sessionStore = new InMemorySessionStore();
