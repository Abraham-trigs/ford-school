import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Middleware for superadmin routes
export async function middleware(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // If no token, try refresh token
    if (!accessToken) {
      const refreshToken = req.cookies.get("superAdminRefreshToken")?.value;
      if (!refreshToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      // Call internal refresh endpoint
      const refreshRes = await fetch(
        `${req.nextUrl.origin}/api/auth/superadmin/refresh`,
        {
          method: "POST",
          headers: { cookie: `superAdminRefreshToken=${refreshToken}` },
        }
      );

      if (!refreshRes.ok) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const data = await refreshRes.json();
      accessToken = data.accessToken;
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET) as {
      id: number;
      role: string;
      email?: string;
    };

    if (decoded.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const headers = new Headers(req.headers);
    headers.set("x-superadmin-id", decoded.id.toString());

    return NextResponse.next({ request: { headers } });
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/auth/superadmin/:path*"],
};
