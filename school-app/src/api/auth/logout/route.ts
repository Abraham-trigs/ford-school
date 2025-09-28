import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth/authService";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    await logoutUser(userId, refreshToken);

    const res = NextResponse.json({ success: true });
    res.cookies.delete("refreshToken", { path: "/" });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
