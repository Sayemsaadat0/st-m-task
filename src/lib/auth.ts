import { NextResponse } from "next/server";

// Simple auth stub - replace with actual authentication logic
export function authenticateRequest(request: Request) {
  // For now, return a simple success response
  // Replace this with your actual authentication logic
  return {
    payload: {
      userId: "default-user-id",
      role: "admin",
    },
  };
}
