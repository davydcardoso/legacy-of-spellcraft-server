import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://mmorpg:mmorpg_pass@localhost:5432/mmorpg'
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export default pool;
