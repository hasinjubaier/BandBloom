import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const rawUrl = process.env.SYNC_DATABASE_URL || process.env.DATABASE_URL;
    let connectionString: string | undefined;

    if (rawUrl) {
      // Normalize asyncpg URL to standard postgresql URL
      connectionString = rawUrl.replace(/^postgresql\+asyncpg:\/\//, "postgresql://");
    }

    pool = new Pool({
      connectionString: connectionString || undefined,
      host: process.env.PGHOST || "127.0.0.1",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "bandbloom_user",
      password: process.env.PGPASSWORD || undefined,
      database: process.env.PGDATABASE || "bandbloom_db",
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG === "True" && duration > 200) {
      console.warn(`Slow query (${duration}ms): ${text.slice(0, 100)}`);
    }
    return res;
  } catch (error) {
    console.error("Database query error:", { text: text.slice(0, 120), error });
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
