const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'bandbloom_user',
  database: 'bandbloom_db'
});

async function seedPasswords() {
  const hash = await bcrypt.hash('Password123!', 10);
  await pool.query('UPDATE users SET password_hash = $1', [hash]);
  await pool.query('UPDATE profiles SET full_name = $1 WHERE user_id = $2', ['Demo Student', '33333333-3333-3333-3333-333333333333']);
  await pool.query('UPDATE profiles SET full_name = $1 WHERE user_id = $2', ['System Admin', '11111111-1111-1111-1111-111111111111']);
  console.log('Seeded passwords and profile full_names successfully');
  await pool.end();
}

seedPasswords().catch((err) => {
  console.error(err);
  process.exit(1);
});
