import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { schoolService } from "@/services/schoolService";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

interface Params {
  id: string;
}

/**
 * GET /api/schools/[id]
 * Returns a single school by ID
 */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = authenticate(req);
    const result = await schoolService.getSchool(user, params.id);
    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/schools/[id]
 * Updates a school
 */
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = authenticate(req);
    const body = await req.json();
    const result = await schoolService.updateSchool(user, params.id, body);
    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/schools/[id]
 * Soft-deletes a school
 */
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = authenticate(req);
    const result = await schoolService.deleteSchool(user, params.id);
    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
