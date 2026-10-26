import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/server/db";

export async function GET() {
  try {
    const health = await checkDatabaseHealth();

    if (health.healthy) {
      return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          latencyMs: health.latencyMs,
        },
      });
    }

    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: health.error || "PostgreSQL connectivity check failed",
        },
      },
      { status: 503 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Health endpoint error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: err.message || "Failed to execute health check",
      },
      { status: 500 }
    );
  }
}
