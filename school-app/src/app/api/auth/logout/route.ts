import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/cookies";

// Handles POST /api/auth/logout
export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });
  clearAuthCookies(res);
  return res;
}
