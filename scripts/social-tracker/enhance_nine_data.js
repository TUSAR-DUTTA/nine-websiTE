const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ALL_ENRICHMENTS = [
  {
    handle: 'NineDcat',
    displayName: 'Nine The Cat',
    avatarUrl: '/assets/mascot/mascot_main.webp',
    title: '👑 OFFICIAL $NINE MASCOT',
    quote: '"Nine lives. One on-chain rebellion. $nine is the permanent monument to retail conviction."',
    achievements: ['OFFICIAL MASCOT', 'CORE PILLAR', 'GENESIS CAT'],
    postsCount: 19,
    topPostImpressions: 48500,
    score: 96.5,
  },
];

async function enhance() {
  if (!process.env.DATABASE_URL) {
    console.log('[ENHANCE] No DATABASE_URL found. Updating local latest_workers.json cache only.');
    updateLocalCache();
    return;
  }

  console.log('[ENHANCE] Connecting to Supabase PostgreSQL for $nine data sync...');
  try {
    for (let i = 0; i < ALL_ENRICHMENTS.length; i++) {
      const e = ALL_ENRICHMENTS[i];
      const rank = i + 1;
      await pool.query(`
        INSERT INTO bag_workers (
          twitter_handle, display_name, avatar_url, bag_worker_score,
          posts_count, active_days, top_post_impressions, total_impressions,
          total_likes, total_retweets, consistency_score, custom_title,
          latest_post_quote, achievements, rank
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (twitter_handle) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          avatar_url = EXCLUDED.avatar_url,
          bag_worker_score = EXCLUDED.bag_worker_score,
          posts_count = EXCLUDED.posts_count,
          top_post_impressions = EXCLUDED.top_post_impressions,
          total_impressions = EXCLUDED.total_impressions,
          custom_title = EXCLUDED.custom_title,
          latest_post_quote = EXCLUDED.latest_post_quote,
          achievements = EXCLUDED.achievements,
          rank = EXCLUDED.rank,
          last_scraped_at = NOW();
      `, [
        e.handle,
        e.displayName,
        e.avatarUrl,
        e.score,
        e.postsCount,
        7,
        e.topPostImpressions,
        e.topPostImpressions * 2,
        Math.round(e.topPostImpressions / 35),
        Math.round(e.topPostImpressions / 120),
        95,
        e.title,
        e.quote,
        e.achievements,
        rank
      ]);
      console.log(`[ENHANCE] Synced @${e.handle} (#${rank})`);
    }
  } catch (err) {
    console.error('[ENHANCE] Database error:', err.message);
  } finally {
    await pool.end();
  }

  updateLocalCache();
}

function updateLocalCache() {
  const cachePath = path.join(__dirname, 'latest_workers.json');
  const formatted = ALL_ENRICHMENTS.map((e, idx) => ({
    rank: idx + 1,
    twitterHandle: e.handle,
    displayName: e.displayName,
    avatarUrl: e.avatarUrl,
    bagWorkerScore: e.score,
    scoreBreakdown: {
      postsPoints: Number(Math.min(30.0, e.postsCount * 1.5 + 5.0).toFixed(1)),
      streakPoints: 25.0,
      reachPoints: Number(Math.min(35.0, Math.log10(Math.max(10, e.topPostImpressions)) * 7.5).toFixed(1)),
      consistencyPoints: 9.5,
    },
    postsCount: e.postsCount,
    activeDays: 7,
    topPostImpressions: e.topPostImpressions,
    totalImpressions: e.topPostImpressions * 2,
    totalLikes: Math.round(e.topPostImpressions / 35),
    totalRetweets: Math.round(e.topPostImpressions / 120),
    consistencyScore: 95,
    customTitle: e.title,
    latestPostQuote: e.quote,
    latestTweetUrl: `https://x.com/${e.handle}`,
    achievements: e.achievements,
    profile: {
      displayName: e.displayName,
      twitterHandle: e.handle,
      avatarUrl: e.avatarUrl,
      nineHoldings: 1000000,
      holdingSince: 'Day 1',
      achievements: e.achievements,
    },
  }));

  fs.writeFileSync(
    cachePath,
    JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalTweets: 45,
      totalWorkers: formatted.length,
      cumulativeReach: formatted.reduce((acc, w) => acc + w.totalImpressions, 0),
      workers: formatted,
    }, null, 2)
  );
  console.log(`[ENHANCE] Updated local cache at ${cachePath} with $nine workers.`);
}

enhance().catch(console.error);
