import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/auth.validator";
import { loginUser } from "@/features/auth/auth.service";
import { attachAuthCookies } from "@/lib/auth/cookies";

// Handles POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);

    // Authenticate user against DB (Prisma logic inside loginUser)
    const { user } = await loginUser(parsed.email, parsed.password, parsed.schoolId);

    const res = NextResponse.json({
      message: "Login successful",
      user,
    });

    // Attach access + refresh cookies
    attachAuthCookies(res, {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId,
    });

    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: err.message || "Login failed" },
      { status: 400 }
    );
  }
}
