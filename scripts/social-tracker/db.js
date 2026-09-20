/**
 * Database client and SQL push helper for Social Bag Workers
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('[DB] No DATABASE_URL found in environment. Database push will be bypassed or sent to API fallback.');
      return null;
    }
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' || connectionString.includes('supabase') || connectionString.includes('neon')
        ? { rejectUnauthorized: false }
        : false,
    });
  }
  return pool;
}

/**
 * Push an array of scraped bag workers into PostgreSQL
 */
async function pushWorkersToDatabase(workers) {
  const db = getPool();
  if (!db) {
    console.log('[DB] DATABASE_URL not set. Skipping SQL push.');
    return { success: false, reason: 'NO_DATABASE_URL' };
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    for (const w of workers) {
      // 1. Upsert worker
      const upsertWorkerText = `
        INSERT INTO bag_workers (
          twitter_handle, display_name, avatar_url, bio, is_verified, twitter_followers,
          bag_worker_score, posts_count, active_days, top_post_impressions,
          total_impressions, total_likes, total_retweets, consistency_score,
          custom_title, achievements, latest_post_quote, last_scraped_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, NOW()
        )
        ON CONFLICT (twitter_handle) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          avatar_url = COALESCE(EXCLUDED.avatar_url, bag_workers.avatar_url),
          bio = COALESCE(EXCLUDED.bio, bag_workers.bio),
          is_verified = EXCLUDED.is_verified,
          twitter_followers = EXCLUDED.twitter_followers,
          bag_worker_score = EXCLUDED.bag_worker_score,
          posts_count = EXCLUDED.posts_count,
          active_days = EXCLUDED.active_days,
          top_post_impressions = GREATEST(EXCLUDED.top_post_impressions, bag_workers.top_post_impressions),
          total_impressions = EXCLUDED.total_impressions,
          total_likes = EXCLUDED.total_likes,
          total_retweets = EXCLUDED.total_retweets,
          consistency_score = EXCLUDED.consistency_score,
          custom_title = EXCLUDED.custom_title,
          achievements = EXCLUDED.achievements,
          latest_post_quote = EXCLUDED.latest_post_quote,
          last_scraped_at = NOW();
      `;

      await client.query(upsertWorkerText, [
        w.twitterHandle,
        w.displayName,
        w.avatarUrl || '/assets/mascot/mascot_head_favicon.webp',
        w.bio || 'Conviction bag worker on Robinhood Chain.',
        Boolean(w.isVerified),
        w.twitterFollowers || 0,
        w.bagWorkerScore || 0,
        w.postsCount || 0,
        w.activeDays || 1,
        w.topPostImpressions || 0,
        w.totalImpressions || 0,
        w.totalLikes || 0,
        w.totalRetweets || 0,
        w.consistencyScore || 50,
        w.customTitle || '🐈 BAG WORKER',
        w.achievements || ['BAG WORKER', 'TIMELINE SUPPORTER'],
        w.latestPostQuote || '',
      ]);

      // 2. Insert any individual tweets attached
      if (w.recentTweets && w.recentTweets.length > 0) {
        for (const t of w.recentTweets) {
          const insertTweetText = `
            INSERT INTO worker_tweets (
              tweet_id, twitter_handle, tweet_text, tweet_url,
              impressions, likes, retweets, replies, has_media, posted_at
            ) VALUES (
              $1, $2, $3, $4,
              $5, $6, $7, $8, $9, $10
            )
            ON CONFLICT (tweet_id) DO UPDATE SET
              impressions = GREATEST(EXCLUDED.impressions, worker_tweets.impressions),
              likes = GREATEST(EXCLUDED.likes, worker_tweets.likes),
              retweets = GREATEST(EXCLUDED.retweets, worker_tweets.retweets),
              replies = GREATEST(EXCLUDED.replies, worker_tweets.replies);
          `;

          await client.query(insertTweetText, [
            t.tweetId,
            w.twitterHandle,
            t.text,
            t.url,
            t.impressions || 0,
            t.likes || 0,
            t.retweets || 0,
            t.replies || 0,
            Boolean(t.hasMedia),
            t.postedAt || new Date().toISOString(),
          ]);
        }
      }
    }

    // 3. Recalculate ranks across entire leaderboard
    await client.query(`
      WITH Ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY bag_worker_score DESC) as new_rank
        FROM bag_workers
      )
      UPDATE bag_workers
      SET rank = Ranked.new_rank
      FROM Ranked
      WHERE bag_workers.id = Ranked.id;
    `);

    await client.query('COMMIT');
    console.log(`[DB] Successfully pushed ${workers.length} bag workers and updated ranks.`);
    return { success: true, count: workers.length };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[DB] Transaction failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Fetch top ranked workers from database
 */
async function getTopBagWorkers(limit = 50) {
  const db = getPool();
  if (!db) return null;

  try {
    const res = await db.query(
      `SELECT * FROM bag_workers ORDER BY rank ASC LIMIT $1`,
      [limit]
    );
    return res.rows;
  } catch (err) {
    console.error('[DB] Fetch failed:', err);
    return null;
  }
}

module.exports = {
  getPool,
  pushWorkersToDatabase,
  getTopBagWorkers,
};
