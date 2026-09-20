const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const handles = await pool.query('SELECT twitter_handle FROM bag_workers ORDER BY rank ASC');
  for (const row of handles.rows) {
    const t = await pool.query(
      'SELECT tweet_url, tweet_text, impressions, posted_at FROM worker_tweets WHERE twitter_handle = $1 ORDER BY impressions DESC LIMIT 1',
      [row.twitter_handle]
    );
    if (t.rows.length > 0) {
      console.log(`=== @${row.twitter_handle} (${t.rows[0].impressions} views) ===`);
      console.log(t.rows[0].tweet_text);
      console.log('');
    }
  }
  await pool.end();
}
check().catch(console.error);
