import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/auth/authService";

export async function POST(req: Request) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    const { accessToken } = await refreshAccessToken(refreshToken);
    return NextResponse.json({ accessToken });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
