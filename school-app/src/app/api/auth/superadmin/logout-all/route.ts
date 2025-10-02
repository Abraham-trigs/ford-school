import { NextRequest, NextResponse } from "next/server";
import { revokeSessions } from "@/lib/superadmin/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token required for logout" },
        { status: 400 }
      );
    }

    // ✅ Revoke only this refresh token
    const result = await revokeSessions(0, { token: refreshToken }); 
    // superAdminId not needed if token is unique

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Session not found or already revoked" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
