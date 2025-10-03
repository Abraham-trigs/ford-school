import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function authenticate(req: NextRequest, allowedRoles?: string[]) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" };

  const token = authHeader.split(" ")[1];
  let payload: any;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw { status: 401, message: "Invalid token" };
  }

  if (allowedRoles && !allowedRoles.some(role => payload.roles.includes(role))) {
    throw { status: 403, message: "Forbidden" };
  }

  return payload;
}
