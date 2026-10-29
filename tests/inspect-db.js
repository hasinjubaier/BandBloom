const { Client } = require("../apps/web/node_modules/pg");

async function checkDatabase() {
  const client = new Client({
    host: "127.0.0.1",
    port: 5433,
    user: "bandbloom_user",
    password: "bandbloom_password",
    database: "bandbloom_db",
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL on port 5433!");

    // List tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("\nExisting Tables in public schema:");
    tablesRes.rows.forEach((r) => console.log(" - " + r.table_name));

    // Check row counts for key tables
    console.log("\nRow counts in tables:");
    for (const r of tablesRes.rows) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) AS c FROM "${r.table_name}"`);
        console.log(` - ${r.table_name}: ${countRes.rows[0].c}`);
      } catch (err) {
        console.log(` - ${r.table_name}: [Error reading count: ${err.message}]`);
      }
    }

    // Check extensions
    const extRes = await client.query(`SELECT extname, extversion FROM pg_extension;`);
    console.log("\nExtensions installed:");
    extRes.rows.forEach((e) => console.log(` - ${e.extname} (${e.extversion})`));

    await client.end();
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
}

checkDatabase();

