// File: /app/api/auth/logout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out" });

    // Clear the JWT cookie
    response.cookies.set({
      name: "session",
      value: "",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // expires immediately
    });

    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
