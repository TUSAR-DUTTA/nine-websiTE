import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Local cache path written by the 6-hour runner
const CACHE_PATH = path.join(process.cwd(), 'scripts', 'social-tracker', 'latest_workers.json');

// In-memory hot cache
let inMemoryWorkers: any[] | null = null;
let lastUpdatedAt: string | null = null;
let pgPool: Pool | null = null;

function getPgPool() {
  if (!pgPool && process.env.DATABASE_URL) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      max: 5,
    });
  }
  return pgPool;
}

export async function GET() {
  const dbDiag: { hasEnv: boolean; error: string | null } = {
    hasEnv: Boolean(process.env.DATABASE_URL),
    error: null,
  };

  try {
    // 1. Try Supabase PostgreSQL Database
    const pool = getPgPool();
    if (pool) {
      try {
        const [res, countRes] = await Promise.all([
          pool.query(`
            SELECT bw.*, 
              (SELECT wt.tweet_url FROM worker_tweets wt WHERE wt.twitter_handle = bw.twitter_handle ORDER BY wt.impressions DESC, wt.posted_at DESC LIMIT 1) as top_tweet_url,
              (SELECT wt.posted_at FROM worker_tweets wt WHERE wt.twitter_handle = bw.twitter_handle ORDER BY wt.impressions DESC, wt.posted_at DESC LIMIT 1) as top_tweet_time
            FROM bag_workers bw 
            ORDER BY bw.rank ASC, bw.bag_worker_score DESC 
            LIMIT 50;
          `),
          pool.query(`SELECT count(*) as total_tweets FROM worker_tweets;`)
        ]);

        if (!res.rows || res.rows.length === 0) {
          return NextResponse.json({
            success: true,
            source: 'SUPABASE_POSTGRESQL',
            lastUpdated: new Date().toISOString(),
            totalTracked: 0,
            macroStats: {
              totalTracked: 0,
              totalTweets: 0,
              cumulativeImpressions: 0,
              topViralReach: 0,
              topViralHandle: '—',
              topVolumeCount: 0,
              topVolumeHandle: '—',
              engine: 'Playwright Stealth 6H Automation',
              database: 'Supabase PostgreSQL (Port 6543 Pooler)',
            },
            leaderboard: [],
            formula: 'Score = Posts(max 30) + Streak(max 25) + Reach(max 35) + Consistency(max 10)',
          });
        }

        const totalTweetsCount = parseInt(countRes.rows[0]?.total_tweets || '0', 10);
        const dbWorkers = res.rows.map((r: any) => {
          const postsPts = Number(Math.min(30.0, r.posts_count * 1.5 + 5.0).toFixed(1));
          const streakPts = Number(Math.min(25.0, r.active_days * 5.0).toFixed(1));
          const reachPts = Number(Math.min(35.0, Math.log10(Math.max(10, Number(r.top_post_impressions))) * 7.5).toFixed(1));
          const consistencyPts = Number(Math.min(10.0, (r.consistency_score || 50) * 0.1).toFixed(1));

          return {
            rank: r.rank,
            twitterHandle: r.twitter_handle,
            displayName: r.display_name,
            avatarUrl: r.avatar_url || '/assets/mascot/mascot_head_favicon.webp',
            bagWorkerScore: Number(r.bag_worker_score),
            scoreBreakdown: {
              postsPoints: postsPts,
              streakPoints: streakPts,
              reachPoints: reachPts,
              consistencyPoints: consistencyPts,
            },
            postsCount: r.posts_count,
            activeDays: r.active_days,
            topPostImpressions: Number(r.top_post_impressions),
            totalImpressions: Number(r.total_impressions),
            totalLikes: r.total_likes,
            totalRetweets: r.total_retweets,
            consistencyScore: r.consistency_score,
            customTitle: r.custom_title || '🐱 $NINE BAG WORKER',
            latestPostQuote: r.latest_post_quote || '"Working the bag."',
            latestTweetUrl: r.top_tweet_url || `https://x.com/${r.twitter_handle}`,
            latestTweetTime: r.top_tweet_time,
            achievements: r.achievements || ['$NINE HOLDER', 'BAG WORKER'],
          };
        });

        const totalCumulativeImpressions = dbWorkers.reduce(
          (acc, w) => acc + (w.totalImpressions || w.topPostImpressions || 0),
          0
        );

        const topViral = dbWorkers.reduce(
          (prev, curr) => (curr.topPostImpressions > prev.topPostImpressions ? curr : prev),
          dbWorkers[0]
        );
        const topVolume = dbWorkers.reduce(
          (prev, curr) => (curr.postsCount > prev.postsCount ? curr : prev),
          dbWorkers[0]
        );

        return NextResponse.json({
          success: true,
          source: 'SUPABASE_POSTGRESQL',
          lastUpdated: res.rows[0]?.last_scraped_at || new Date().toISOString(),
          totalTracked: dbWorkers.length,
          macroStats: {
            totalTracked: dbWorkers.length,
            totalTweets: totalTweetsCount,
            cumulativeImpressions: totalCumulativeImpressions,
            topViralReach: topViral?.topPostImpressions || 0,
            topViralHandle: topViral?.twitterHandle || '—',
            topVolumeCount: topVolume?.postsCount || 0,
            topVolumeHandle: topVolume?.twitterHandle || '—',
            engine: 'Playwright Stealth 6H Automation',
            database: 'Supabase PostgreSQL (Port 6543 Pooler)',
          },
          leaderboard: dbWorkers,
          formula: 'Score = Posts(max 30) + Streak(max 25) + Reach(max 35) + Consistency(max 10)',
        });
      } catch (dbErr: any) {
        console.warn('Database query error, falling back to cache:', dbErr.message);
        dbDiag.error = dbErr.message;
      }
    }

    // 2. Check in-memory hot cache
    if (inMemoryWorkers && inMemoryWorkers.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'IN_MEMORY_HOT_CACHE',
        lastUpdated: lastUpdatedAt || new Date().toISOString(),
        totalTracked: inMemoryWorkers.length,
        leaderboard: inMemoryWorkers,
        dbStatus: dbDiag,
        formula: 'Score = (Posts * 0.20) + (ActiveDays * 0.40) + (Log10(Impressions) * 4.5) + (Consistency * 0.20)',
      });
    }

    // 3. Check local JSON file cache from 6-hour scraper
    if (fs.existsSync(CACHE_PATH)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        if (fileData?.workers && fileData.workers.length > 0) {
          inMemoryWorkers = fileData.workers;
          lastUpdatedAt = fileData.lastUpdated;
          return NextResponse.json({
            success: true,
            source: 'SCRAPER_SNAPSHOT_CACHE',
            lastUpdated: fileData.lastUpdated,
            totalTracked: fileData.workers.length,
            leaderboard: fileData.workers,
            dbStatus: dbDiag,
            formula: 'Score = (Posts * 0.20) + (ActiveDays * 0.40) + (Log10(Impressions) * 4.5) + (Consistency * 0.20)',
          });
        }
      } catch (err) {
        console.warn('Error reading scraper cache file:', err);
      }
    }

    // 4. Default clean empty state (Awaiting community launch)
    return NextResponse.json({
      success: true,
      source: 'AWAITING_LAUNCH',
      lastUpdated: new Date().toISOString(),
      totalTracked: 0,
      macroStats: {
        totalTracked: 0,
        totalTweets: 0,
        cumulativeImpressions: 0,
        topViralReach: 0,
        topViralHandle: '—',
        topVolumeCount: 0,
        topVolumeHandle: '—',
        engine: 'Playwright Stealth 6H Automation',
        database: 'Supabase PostgreSQL (Port 6543 Pooler)',
      },
      leaderboard: [],
      dbStatus: dbDiag,
      formula: 'Score = (Posts * 0.20) + (ActiveDays * 0.40) + (Log10(Impressions) * 4.5) + (Consistency * 0.20)',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('Authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workers } = body;

    if (!Array.isArray(workers) || workers.length === 0) {
      return NextResponse.json({ error: 'Invalid workers payload' }, { status: 400 });
    }

    inMemoryWorkers = workers;
    lastUpdatedAt = new Date().toISOString();

    try {
      const dir = path.dirname(CACHE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        CACHE_PATH,
        JSON.stringify({ lastUpdated: lastUpdatedAt, workers, totalWorkers: workers.length }, null, 2)
      );
    } catch (fsErr) {
      console.warn('Could not write to cache file:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${workers.length} bag workers in live telemetry feed`,
      timestamp: lastUpdatedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
