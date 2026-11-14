// One pool per process. The pg library looks after opening/closing sockets,
// route code just borrows a client for the duration of a query.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'hotels_db',
  max: 10,
  idleTimeoutMillis: 30_000,
});

// Tiny helper so controllers can read almost like plain SQL: q('select ...', [a, b])
async function q(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { pool, q };
