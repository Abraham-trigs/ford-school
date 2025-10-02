import { NextRequest, NextResponse } from "next/server";
import { revokeSessions } from "@/lib/superadmin/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { superAdminId } = await req.json();

    if (!superAdminId) {
      return NextResponse.json(
        { message: "superAdminId required for logout-all" },
        { status: 400 }
      );
    }

    // ✅ Revoke ALL sessions for this superadmin
    const result = await revokeSessions(Number(superAdminId));

    if (result.count === 0) {
      return NextResponse.json(
        { message: "No active sessions found" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "All sessions logged out successfully",
      revokedSessions: result.count,
    });
  } catch (err) {
    console.error("Logout-all error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
