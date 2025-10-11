import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth/cookies"; // ✅ same cookie module

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json(null, { status: 401 });
  return NextResponse.json(user);
}

