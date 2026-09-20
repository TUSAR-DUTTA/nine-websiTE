const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.ptthcotrpsxgeujskcpx:9854816330%40@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";

async function runMigration() {
  console.log('[MIGRATION] Connecting to Supabase...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('[MIGRATION] Applying schema.sql...');
    await client.query(schemaSql);
    console.log('[MIGRATION] Schema applied successfully!');

    // Check created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('[MIGRATION] Tables in public schema:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('[MIGRATION ERROR]:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
