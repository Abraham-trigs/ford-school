import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { schoolService } from "@/services/schoolService";
import { ForbiddenError } from "@/lib/errors";

/**
 * GET /api/schools
 * Returns paginated list of schools based on user role and memberships
 */
export async function GET(req: NextRequest) {
  try {
    const user = authenticate(req); // { id, roles }
    const url = new URL(req.url);

    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const pageSize = Math.max(Number(url.searchParams.get("pageSize")) || 20, 1);

    const result = await schoolService.getSchools(user, page, pageSize);

    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/schools
 * Creates a new school
 */
export async function POST(req: NextRequest) {
  try {
    const user = authenticate(req);
    const body = await req.json();

    const result = await schoolService.createSchool(user, body);

    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
