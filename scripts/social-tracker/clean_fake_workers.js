const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanFakeWorkers() {
  console.log('[CLEANUP] Connecting to Supabase to remove fake seed workers...');
  
  // 1. Delete fake mock accounts
  const deleteQuery = `
    DELETE FROM bag_workers 
    WHERE twitter_handle IN (
      'catlord', 
      'keith_gme', 
      'roaring_feline', 
      'chaoticwhiskers', 
      'paperhand_pete'
    );
  `;
  const delRes = await pool.query(deleteQuery);
  console.log(`[CLEANUP] Deleted ${delRes.rowCount} fake mock accounts from Supabase.`);

  // 2. Recalculate ranks across real $AI workers
  await pool.query(`
    WITH Ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY bag_worker_score DESC, total_impressions DESC) as new_rank
      FROM bag_workers
    )
    UPDATE bag_workers
    SET rank = Ranked.new_rank
    FROM Ranked
    WHERE bag_workers.id = Ranked.id;
  `);
  console.log('[CLEANUP] Ranks recalculated for real $AI bag workers.');

  // 3. Fetch current real workers
  const res = await pool.query(`
    SELECT rank, twitter_handle, bag_worker_score, posts_count, top_post_impressions, latest_post_quote
    FROM bag_workers
    ORDER BY rank ASC;
  `);

  console.log(`[CLEANUP] Real $AI Workers in Database (${res.rows.length} total):`);
  res.rows.slice(0, 10).forEach(r => {
    console.log(`  #${r.rank} @${r.twitter_handle} - Score: ${r.bag_worker_score} | Posts: ${r.posts_count} | Views: ${r.top_post_impressions}`);
  });

  // 4. Update latest_workers.json cache to only contain real workers
  const cacheFile = path.join(__dirname, 'latest_workers.json');
  if (fs.existsSync(cacheFile)) {
    const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const filteredWorkers = (data.workers || []).filter(w => 
      !['catlord', 'keith_gme', 'roaring_feline', 'chaoticwhiskers', 'paperhand_pete'].includes(w.twitterHandle)
    );
    filteredWorkers.sort((a, b) => b.bagWorkerScore - a.bagWorkerScore);
    filteredWorkers.forEach((w, idx) => { w.rank = idx + 1; });

    fs.writeFileSync(cacheFile, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalTweets: data.totalTweets || 32,
      workers: filteredWorkers
    }, null, 2));
    console.log(`[CLEANUP] Cleaned latest_workers.json. Now has ${filteredWorkers.length} real workers.`);
  }

  await pool.end();
}

cleanFakeWorkers().catch(console.error);
