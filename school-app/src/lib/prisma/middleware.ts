import { Prisma } from "@prisma/client";

/**
 * Prisma middleware to implement soft delete behavior globally.
 * 
 * - Filters out records with deletedAt !== null on all find queries.
 * - Converts delete/deleteMany into update/updateMany that set deletedAt timestamp.
 * - Allows bypassing via `includeDeleted: true` in query options.
 * 
 * Usage:
 *   import { prisma } from "@/lib/prisma/prisma";
 *   prisma.$use(softDeleteMiddleware);
 */
export const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  const { action, model, args } = params;

  // List of actions to be affected
  const findActions = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "findMany"];
  const deleteActions = ["delete", "deleteMany"];

  // 1. Intercept find queries to exclude soft-deleted records
  if (model && findActions.includes(action)) {
    // Check if args.where is defined; if not, initialize it
    if (!params.args.where) {
      params.args.where = {};
    }

    // Bypass soft-delete logic if 'includeDeleted: true' is explicitly set
    if (params.args.where.includeDeleted === true) {
      delete params.args.where.includeDeleted;
      return next(params);
    }
    
    // Add the deletedAt filter to the where clause
    params.args.where.deletedAt = null;
  }

  // 2. Intercept delete queries and convert them to update queries
  if (model && deleteActions.includes(action)) {
    // For `delete`
    if (action === "delete") {
      params.action = "update";
      // Ensure data object exists and set deletedAt
      params.args.data = { deletedAt: new Date() };
    }

    // For `deleteMany`
    if (action === "deleteMany") {
      params.action = "updateMany";
      // Ensure data object exists and set deletedAt
      params.args.data = { ...params.args.data, deletedAt: new Date() };
    }
  }

  return next(params);
};
