// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  try {
    const payload = verifyAccessToken(token);
    const { pathname } = req.nextUrl;

    // Role gate: only SUPER_ADMIN can access /dashboard/superadmin
    if (pathname.startsWith("/dashboard/superadmin") && payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Token valid → continue
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
