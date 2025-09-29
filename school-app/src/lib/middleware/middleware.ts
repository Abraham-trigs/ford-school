import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const payload = verifyJwt(token);
  if (!payload) return NextResponse.redirect(new URL("/login", req.url));

  // Optionally attach payload to request (if using server actions later)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"], // protect these routes
};
