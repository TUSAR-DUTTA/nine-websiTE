const { Pool } = require('pg');

// Handle both raw with double @ and URL encoded @
const rawConn = "postgresql://postgres.ptthcotrpsxgeujskcpx:9854816330@@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";
const encodedConn = "postgresql://postgres.ptthcotrpsxgeujskcpx:9854816330%40@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";

async function testConnection(connectionString, label) {
  console.log(`[TEST] Testing connection (${label})...`);
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log(`[SUCCESS] Connected to Supabase PostgreSQL (${label})!`);
    
    const res = await client.query('SELECT NOW() as now, version() as version;');
    console.log('[INFO] Database Current Time:', res.rows[0].now);
    console.log('[INFO] PostgreSQL Version:', res.rows[0].version.split(',')[0]);

    client.release();
    await pool.end();
    return true;
  } catch (err) {
    console.error(`[ERROR] Connection failed (${label}):`, err.message);
    await pool.end();
    return false;
  }
}

async function run() {
  const ok1 = await testConnection(encodedConn, 'URL Encoded Password');
  if (!ok1) {
    await testConnection(rawConn, 'Raw Connection String');
  }
}

run();
