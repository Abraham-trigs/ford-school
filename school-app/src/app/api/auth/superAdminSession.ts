import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Middleware
export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Authorization header missing or invalid" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
      email?: string;
    };

    // ✅ Enforce SUPERADMIN role
    if (decoded.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ✅ Inject only the superadmin ID into headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-superadmin-id", decoded.id.toString());

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

// ✅ Only applies to superadmin routes
export const config = {
  matcher: ["/api/auth/superadmin/:path*"],
};
