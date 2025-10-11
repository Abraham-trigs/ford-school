import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { signAccessToken } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const access = req.cookies.get("access_token")?.value;
  const refresh = req.cookies.get("formless_refresh_token")?.value;
  const url = req.nextUrl;

  // Skip auth for login/public routes
  if (url.pathname.startsWith("/api/auth") || url.pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  // If no tokens, redirect to login
  if (!access && !refresh) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Try verifying access token
  try {
    verifyAccessToken(access!);
    return NextResponse.next();
  } catch {
    // Access expired — try refresh endpoint
    if (refresh) {
      try {
        const res = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) return NextResponse.next();
      } catch {}
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"], // Protect private routes
};
