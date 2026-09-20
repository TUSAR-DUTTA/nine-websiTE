const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const res1 = await pool.query('SELECT count(*) as total_workers FROM bag_workers;');
  const res2 = await pool.query('SELECT count(*) as total_tweets FROM worker_tweets;');
  console.log('--- SUPABASE LIVE TELEMETRY STATS ---');
  console.log('Total Bag Workers:', res1.rows[0].total_workers);
  console.log('Total Archived Tweets:', res2.rows[0].total_tweets);
  await pool.end();
}

check().catch(console.error);
