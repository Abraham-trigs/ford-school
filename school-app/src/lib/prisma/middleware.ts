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

  // ✅ Handle queries that should automatically exclude soft-deleted records
  if (
    action.startsWith("find") &&
    model &&
    !(args?.where?.includeDeleted === true)
  ) {
    if (!args.where) args.where = {};
    args.where.deletedAt = null;
  }

  // ✅ Intercept single deletes
  if (action === "delete" && model) {
    params.action = "update";
    params.args["data"] = { deletedAt: new Date() };
  }

  // ✅ Intercept bulk deletes
  if (action === "deleteMany" && model) {
    params.action = "updateMany";
    if (!params.args.data) params.args["data"] = {};
    params.args["data"]["deletedAt"] = new Date();
  }

  // ✅ Pass through
  return next(params);
};
