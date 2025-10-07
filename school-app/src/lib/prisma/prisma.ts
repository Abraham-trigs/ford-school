import { PrismaClient } from "@prisma/client";
import { softDeleteMiddleware } from "./middleware";

declare global {
  // Prevent multiple instances during development (HMR)
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

// Create or reuse Prisma client
export const prisma =
  global.__prismaClient ??
  new PrismaClient({
    log:
      process.env.NODE_ENV !== "production"
        ? ["query", "info", "warn", "error"]
        : undefined,
  });

// Apply middleware
softDeleteMiddleware(prisma);

// Assign to global for dev to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = prisma;
}
