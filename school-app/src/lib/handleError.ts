// /lib/utils/handleError.ts
import { NextResponse } from "next/server";

/**
 * Centralized error handler for all API routes.
 * Normalizes error shape and ensures consistent JSON structure.
 */
export function handleError(error: any): NextResponse {
  console.error("[API ERROR]", error);

  // If error explicitly has a status, return it directly
  const status = error?.status || 500;

  // Extract readable message
  let message =
    error?.message ||
    (typeof error === "string" ? error : "Internal server error");

  // Handle specific known errors
  if (error.name === "ZodError") {
    message = "Validation failed";
  } else if (message.includes("RateLimit")) {
    message = "Too many requests, please try again later";
  } else if (message === "NotFound") {
    message = "Resource not found";
  } else if (message === "Forbidden") {
    message = "Forbidden";
  }

  return NextResponse.json(
    {
      error: {
        message,
        type: error?.name || "Error",
        status,
      },
    },
    { status }
  );
}
