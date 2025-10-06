import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // default 15 min

export interface AuthPayload extends JwtPayload {
  userId: number;
  roles: string[];
  email?: string;
}

// --- Verify token and optionally check roles ---
export function authenticate(req: NextRequest, allowedRoles?: string[]): AuthPayload {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized: Missing token" };
  }

  const token = authHeader.split(" ")[1];

  let payload: AuthPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    throw { status: 401, message: "Invalid or expired token" };
  }

  // Role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => payload.roles.includes(role));
    if (!hasRole) {
      throw { status: 403, message: "Forbidden: Insufficient permissions" };
    }
  }

  return payload; // contains userId, roles, email, etc.
}

// --- Optional helper to check school-level access ---
export async function canAccessSchool(
  userId: number,
  schoolSessionId: number,
  prisma: any
): Promise<boolean> {
  const membership = await prisma.userSchoolSession.findFirst({
    where: { userId, schoolSessionId, active: true },
  });
  return !!membership;
}

// --- Generate access token helper (for refresh flow) ---
export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
