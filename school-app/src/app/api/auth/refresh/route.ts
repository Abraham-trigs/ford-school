import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken } from "@/features/auth/auth.service";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;
  if (!token) return NextResponse.json({ message: "No refresh token" }, { status: 401 });

  const decoded = verifyRefreshToken(token);
  if (!decoded) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

  // Optionally generate new access token here
  return NextResponse.json({ id: decoded.id });
}
