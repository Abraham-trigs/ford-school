import { NextResponse } from "next/server";
import { ZodError } from "zod";

/* ------------------------- Custom API Error ------------------------- */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/* ------------------------- Error Handler ------------------------- */
export function handleError(err: unknown, context?: string): NextResponse {
  console.error(`❌ API Error${context ? ` in ${context}` : ""}:`, err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", details: err.flatten() },
      { status: 400 }
    );
  }

  // Custom API errors
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  // Authentication & RBAC-related
  if (typeof err === "object" && err && "message" in err) {
    const message = (err as any).message?.toLowerCase();
    if (message?.includes("unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (message?.includes("forbidden"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Default fallback
  return NextResponse.json(
    { error: "Internal server error", message: (err as any)?.message ?? "Unknown error" },
    { status: 500 }
  );
}
