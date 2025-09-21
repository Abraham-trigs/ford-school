// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global prisma during dev to avoid multiple instances
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.__prismaClient ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = prisma;
}
