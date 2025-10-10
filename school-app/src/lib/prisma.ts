// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["query", "warn", "error"], // optional: useful in dev
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
