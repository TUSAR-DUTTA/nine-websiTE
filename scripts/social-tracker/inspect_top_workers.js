const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspectWorkers() {
  const res = await pool.query(`
    SELECT bw.rank, bw.twitter_handle, bw.display_name, bw.bag_worker_score, 
           bw.posts_count, bw.active_days, bw.top_post_impressions, bw.total_impressions,
           bw.total_likes, bw.total_retweets, bw.custom_title, bw.latest_post_quote,
           (SELECT wt.tweet_url FROM worker_tweets wt WHERE wt.twitter_handle = bw.twitter_handle ORDER BY wt.impressions DESC LIMIT 1) as top_tweet_url,
           (SELECT wt.tweet_text FROM worker_tweets wt WHERE wt.twitter_handle = bw.twitter_handle ORDER BY wt.impressions DESC LIMIT 1) as top_tweet_text
    FROM bag_workers bw
    ORDER BY bw.rank ASC
    LIMIT 10;
  `);

  console.log('--- TOP 10 WORKERS IN SUPABASE ---');
  res.rows.forEach(r => {
    console.log(`[Rank #${r.rank}] @${r.twitter_handle}:`);
    console.log(`  Display Name: ${r.display_name}`);
    console.log(`  Score: ${r.bag_worker_score} | Posts: ${r.posts_count} | Views: ${r.top_post_impressions}`);
    console.log(`  Likes: ${r.total_likes} | Retweets: ${r.total_retweets}`);
    console.log(`  Top Tweet: ${r.top_tweet_text?.slice(0, 80)}...`);
    console.log(`  URL: ${r.top_tweet_url}`);
    console.log('-------------------------------------------');
  });

  await pool.end();
}

inspectWorkers().catch(console.error);
