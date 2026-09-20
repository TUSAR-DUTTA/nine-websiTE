const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTweets() {
  const res = await pool.query(`
    SELECT twitter_handle, tweet_text, tweet_url, impressions 
    FROM worker_tweets 
    LIMIT 5;
  `);
  console.log('Sample real tweets in Supabase:');
  res.rows.forEach(r => {
    console.log(`@${r.twitter_handle} (${r.impressions} views):`);
    console.log(`  Text: ${r.tweet_text.slice(0, 80)}...`);
    console.log(`  URL: ${r.tweet_url}`);
  });
  await pool.end();
}

checkTweets().catch(console.error);
