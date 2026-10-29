import { Pool } from "pg";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";

// Cache pool instance globally to prevent recreation during development HMR / hot-reloads
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export function getDbPool(): Pool {
  if (!globalForDb.pgPool) {
    const rawUrl = process.env.SYNC_DATABASE_URL || process.env.DATABASE_URL;
    let connectionString: string | undefined;

    if (rawUrl) {
      // Normalize asyncpg URL to standard postgresql URL
      connectionString = rawUrl.replace(/^postgresql\+asyncpg:\/\//, "postgresql://");
      // Prefer explicit IPv4 loopback (127.0.0.1) over 'localhost' to avoid IPv6 (::1) ECONNREFUSED latency on Windows
      connectionString = connectionString.replace(/@localhost:/, "@127.0.0.1:");
    }

    const host = process.env.PGHOST === "localhost" ? "127.0.0.1" : (process.env.PGHOST || "127.0.0.1");
    const port = Number(process.env.PGPORT || 5433);

    globalForDb.pgPool = new Pool({
      connectionString: connectionString || undefined,
      host: connectionString ? undefined : host,
      port: connectionString ? undefined : port,
      user: connectionString ? undefined : (process.env.PGUSER || "bandbloom_user"),
      password: connectionString ? undefined : (process.env.PGPASSWORD || undefined),
      database: connectionString ? undefined : (process.env.PGDATABASE || "bandbloom_db"),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    globalForDb.pgPool.on("error", (err) => {
      console.error("[PostgreSQL Idle Client Error]:", err.message);
    });
  }

  return globalForDb.pgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG === "True" && duration > 200) {
      console.warn(`[Slow Query (${duration}ms)]: ${text.slice(0, 80).replace(/\s+/g, " ").trim()}...`);
    }
    return res;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    const isConnError = err?.code === "ECONNREFUSED" || err?.code === "ETIMEDOUT" || err?.code === "ENOTFOUND";
    if (isConnError) {
      console.error(
        `[Database Connection Error]: Could not reach PostgreSQL server (${err.code || err.message}). Ensure database is running on the configured port.`
      );
    } else {
      console.error(
        `[Database Query Error]: ${err.message || String(err)} (code: ${err.code || "unknown"})`
      );
    }
    throw error;
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const p = getDbPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check utility to safely verify live database connectivity without leaking credentials.
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await query<{ health: number }>("SELECT 1 AS health;");
    const latencyMs = Date.now() - start;
    return {
      healthy: res.rows[0]?.health === 1,
      latencyMs,
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    const latencyMs = Date.now() - start;
    const isConnRefused = error?.code === "ECONNREFUSED" || error?.code === "ETIMEDOUT";
    let errorMsg = "Database query check failed";
    if (isConnRefused) {
      errorMsg = "PostgreSQL server connection refused (service may be stopped or listening on different port)";
    } else if (error?.code === "28P01") {
      errorMsg = "PostgreSQL authentication failed (role does not exist or credentials invalid in active PostgreSQL instance)";
    } else if (error?.code === "3D000") {
      errorMsg = "Configured database does not exist in active PostgreSQL instance";
    }

    return {
      healthy: false,
      latencyMs,
      error: errorMsg,
    };
  }
}
