const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function removeMockAccounts() {
  console.log('[CLEANUP] Connecting to Supabase...');
  const fakeHandles = ['KeithDiamondPaws', 'GME_Retail_Echo', 'WhaleWatchRH', 'DexRadar_RH'];
  
  // 1. Delete from database
  const delRes = await pool.query(
    "DELETE FROM bag_workers WHERE twitter_handle IN ('KeithDiamondPaws', 'GME_Retail_Echo', 'WhaleWatchRH', 'DexRadar_RH')"
  );
  console.log(`[CLEANUP] Deleted ${delRes.rowCount} fake mock accounts from Supabase.`);

  await pool.query(
    "DELETE FROM worker_tweets WHERE twitter_handle IN ('KeithDiamondPaws', 'GME_Retail_Echo', 'WhaleWatchRH', 'DexRadar_RH')"
  );

  // Recalculate ranks for remaining accounts
  await pool.query(`
    WITH Ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY bag_worker_score DESC) as new_rank
      FROM bag_workers
    )
    UPDATE bag_workers
    SET rank = Ranked.new_rank
    FROM Ranked
    WHERE bag_workers.id = Ranked.id;
  `);

  const res = await pool.query('SELECT rank, twitter_handle, display_name, bag_worker_score FROM bag_workers ORDER BY rank ASC;');
  console.log('[CLEANUP] Remaining accounts in Supabase database:');
  console.log(res.rows);

  // 2. Clean latest_workers.json
  const cachePath = path.join(__dirname, 'latest_workers.json');
  if (fs.existsSync(cachePath)) {
    const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    const filtered = (data.workers || []).filter(w => !fakeHandles.includes(w.twitterHandle));
    filtered.forEach((w, idx) => { w.rank = idx + 1; });
    
    fs.writeFileSync(cachePath, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalTweets: 0,
      totalWorkers: filtered.length,
      cumulativeReach: filtered.reduce((acc, w) => acc + (w.totalImpressions || 0), 0),
      workers: filtered
    }, null, 2));
    console.log(`[CLEANUP] Updated latest_workers.json. Now has ${filtered.length} workers.`);
  }

  await pool.end();
}

removeMockAccounts().catch(console.error);
