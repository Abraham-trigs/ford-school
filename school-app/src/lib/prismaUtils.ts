import { NotFoundError } from "./errors";

/**
 * Wrap Prisma findFirstOrThrow queries to automatically map P2025 errors
 * to NotFoundError for consistency.
 */
export async function prismaFindFirstOrThrow<T>(query: Promise<T>): Promise<T> {
  try {
    return await query;
  } catch (err: any) {
    if (err.code === "P2025") throw new NotFoundError("Resource not found");
    throw err;
  }
}
