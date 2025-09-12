export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // clear the session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0), // expire immediately
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
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
