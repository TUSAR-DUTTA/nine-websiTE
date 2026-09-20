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
    handle: 'LongLaunches',
    title: '⚡ #1 POST VOLUME (13 POSTS)',
    quote: '"NEW LAUNCH on @longdotxyz: $AICAT is live, anchored to $AI at $61.9K MC on Robinhood Chain."',
    achievements: ['#1 POST VOLUME', '13 VERIFIED POSTS', 'DEX TRACKER']
  },
  {
    handle: 'gem_detecter',
    title: '👑 #1 VIRAL REACH (19K VIEWS)',
    quote: '"I called $AI below $2M and watched it run over $300M. Now I\'m looking for the next runner from the Long ecosystem."',
    achievements: ['#1 VIRAL CALL', '19K REACH', 'ALPHA CALLER']
  },
  {
    handle: 'ArtificiallyInu',
    title: '🐕 OFFICIAL COMMUNITY LEAD',
    quote: '"Nate tells Ansem and Banks about the moment he realized $AI on Robinhood might be the one. It\'s a crazy ticker."',
    achievements: ['COMMUNITY LEAD', 'DEV DIALOGUE', 'CORE PILLAR']
  },
  {
    handle: 'watchking69',
    title: '🎯 MEME TRINITY ANALYST',
    quote: '"Artificial Inu, Memory Cow, Black Bull — The holy trinity of animal coins this cycle on Robinhood."',
    achievements: ['2.6K REACH', 'CYCLE THESIS', 'MEME ANALYST']
  },
  {
    handle: 'whalewatchRH',
    title: '🐋 ON-CHAIN WHALE TRACKER',
    quote: '"A AI whale just bought $5K of $AI at $282.65M MC on Uniswap v4 (Robinhood Chain)."',
    achievements: ['WHALE TRACKER', 'ON-CHAIN TELEMETRY', 'BLOCKSCOUT VERIFIED']
  },
  {
    handle: 'Truthexpounder',
    title: '🔍 TIMELINE INVESTIGATOR',
    quote: '"I went looking for problems with $ABI. 31 investigations later, here\'s what held up, what broke, and what you\'re not being told."',
    achievements: ['INVESTIGATOR', 'DEEP DIVE', 'ALPHA REPORT']
  },
  {
    handle: 'dudeslavius',
    title: '🔥 RH NARRATIVE SHILLER',
    quote: '"Why on Robinhood? Because $AI runner we have on RH, this RH meta narrative is just getting started."',
    achievements: ['NARRATIVE LEAD', 'RH ECOSYSTEM', 'BAG WORKER']
  },
  {
    handle: 'dexliveevent',
    title: '📈 DEXSCREENER RADAR',
    quote: '"DEXSCREENER BOOST: Boost +10 on Robinhood Chain pair for Artificial Inu ($AI). Honeypot: No."',
    achievements: ['DEX TELEMETRY', 'VOLUME TRACKER', 'BOOST ALERT']
  },
  {
    handle: 'btcbtcethh2',
    title: '💎 BIG 3 CONVICTION HOLDER',
    quote: '"$cashcat, $ai, $PONS — the big 3 all you need to hold on Robinhood Chain. Keep it simple."',
    achievements: ['CONVICTION HOLDER', 'BIG 3 THESIS', 'TIMELINE SUPPORTER']
  },
  {
    handle: 'aristotlewitt',
    title: '🌐 MULTI-CHAIN NARRATIVE WATCH',
    quote: '"Tracing Trump AI poll narrative & Robinhood Chain liquidity flows. Superior Intelligence vs Artificial Inu meta."',
    achievements: ['NARRATIVE FLOWS', 'GLOBAL REACH', 'LIQUIDITY RADAR']
  },
  {
    handle: 'timrek70',
    title: '🧠 FLYWHEEL THEORIST',
    quote: '"LONG figured out the flywheel before anyone else. Artificial Inu isn\'t overvalued—it\'s early: building liquidity for tokenized NVDA."',
    achievements: ['FLYWHEEL THESIS', 'EARLY CONVICTION', 'NVDA LIQUIDITY']
  },
  {
    handle: 'RobinhoodAlphas',
    title: '⚡ RH ECOSYSTEM ALPHA',
    quote: '"@amzninu $AI could be next 100x! Tracking the biggest volume drivers on Robinhood Chain mainnet."',
    achievements: ['ALPHA CALLER', 'ECOSYSTEM RADAR', '100X THESIS']
  },
  {
    handle: 'RH_whale_alert',
    title: '🚨 ON-CHAIN BUY RADAR',
    quote: '"$2.62K more of $AI into an already large AI bag · $267.96M MC on Uniswap v4."',
    achievements: ['WHALE ALERT', 'DEX SWAP RADAR', 'ACCUMULATION']
  },
  {
    handle: 'Matt_Tremolada',
    title: '🤖 AI AGENT ARCHITECT',
    quote: '"Artificial Inu was a redeployed meme under a new primitive for automated on-chain liquidity."',
    achievements: ['AGENT PRIMITIVE', 'TECH RESEARCH', 'AI SYSTEMS']
  },
  {
    handle: 'anoshh_1234',
    title: '⚡ NVDA PAIR THEORIST',
    quote: '"$AI trades against Nvidia on Robinhood chain. Fees go to a vault that buys more NVDA and burns $AI. $283M MC holding the range."',
    achievements: ['NVDA CORRELATION', 'BURN VAULT', 'RH ECOSYSTEM']
  },
  {
    handle: 'alexandrap5277',
    title: '📊 DEX TRACKER ANALYST',
    quote: '"Amazon Inu $AI on Robinhood: Dexape tracked a 449% move from call to ATH on mainnet."',
    achievements: ['449% RUNNER', 'DEX APE', 'ATH RADAR']
  },
  {
    handle: 'TGruber83765',
    title: '🔬 DERIVATIVE BETA ANALYST',
    quote: '"Fart Coin + Artificial Inu = Deriv Beta. Animal coin momentum dynamics across Robinhood."',
    achievements: ['DERIVATIVE BETA', 'TIMELINE SHILLER', 'MOMENTUM']
  },
  {
    handle: 'Wibow1238',
    title: '🛰️ CROSS-CHAIN RADAR',
    quote: '"$AI on Robinhood is Artificial Inu. Tracking cross-chain expansion and contract deployments."',
    achievements: ['CHAIN WATCH', 'EARLY SPOTTER', 'MULTI-CHAIN']
  },
  {
    handle: 'LMS010203',
    title: '🎭 MEME SENTIMENT AGENT',
    quote: '"Artificial Inu is the original style — leading the Robinhood animal token wave."',
    achievements: ['SENTIMENT RADAR', 'BAG HOLDER', 'COMMUNITY DEFENDER']
  },
  {
    handle: 'therealgrumpinu',
    title: '🐕 MEME CRITIC & WATCHER',
    quote: '"Artificial Inu isn\'t even 70 days old and already won\'t stop running on Robinhood Chain."',
    achievements: ['70-DAY CYCLE', 'OG OBSERVER', 'CHART WATCH']
  },
  {
    handle: 'cork1992',
    title: '🗳️ COMMUNITY VOTING BRIGADE',
    quote: '"Attention $AI Family! YOUR vote matters! Less than 100 votes needed to list $AI on the Robinhood Top 100 Leaderboard."',
    achievements: ['TOP 100 VOTE', 'COMMUNITY DRIVE', 'LISTING PUSH']
  }
];

async function enhance() {
  console.log('[ENHANCE] Updating all 21 bag workers in Supabase with verified quotes & titles...');
  
  for (const item of ALL_ENRICHMENTS) {
    await pool.query(`
      UPDATE bag_workers
      SET custom_title = $1,
          latest_post_quote = $2,
          achievements = $3
      WHERE LOWER(twitter_handle) = LOWER($4);
    `, [item.title, item.quote, item.achievements, item.handle]);
  }

  // Recalculate balanced scoring:
  // Volume: LEAST(30.0, posts_count * 1.5 + 5.0)
  // Streak: LEAST(25.0, active_days * 5.0)
  // Reach:  LEAST(35.0, log(GREATEST(10, top_post_impressions)) * 7.5)
  // Consistency: LEAST(10.0, consistency_score * 0.1)
  await pool.query(`
    UPDATE bag_workers
    SET bag_worker_score = ROUND(
      (LEAST(30.0, posts_count * 1.5 + 5.0) + 
       LEAST(25.0, active_days * 5.0) + 
       LEAST(35.0, log(GREATEST(10, top_post_impressions)) * 7.5) + 
       LEAST(10.0, consistency_score * 0.1)
      )::numeric, 1
    );
  `);

  // Recalculate ranks (Score desc, then top_post_impressions desc)
  await pool.query(`
    WITH Ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY bag_worker_score DESC, top_post_impressions DESC) as new_rank
      FROM bag_workers
    )
    UPDATE bag_workers
    SET rank = Ranked.new_rank
    FROM Ranked
    WHERE bag_workers.id = Ranked.id;
  `);

  console.log('[ENHANCE] Recalculated rankings:');
  const res = await pool.query(`
    SELECT rank, twitter_handle, bag_worker_score, posts_count, active_days, top_post_impressions, custom_title
    FROM bag_workers
    ORDER BY rank ASC;
  `);
  res.rows.forEach(r => {
    console.log(`  #${r.rank} @${r.twitter_handle} (${r.bag_worker_score} pts) - ${r.custom_title} | Reach: ${r.top_post_impressions}`);
  });

  // Update latest_workers.json cache with enriched data and exact score breakdowns
  const allRes = await pool.query(`
    SELECT bw.*, 
      (SELECT wt.tweet_url FROM worker_tweets wt WHERE wt.twitter_handle = bw.twitter_handle ORDER BY wt.impressions DESC, wt.posted_at DESC LIMIT 1) as top_tweet_url,
      (SELECT wt.posted_at FROM worker_tweets wt WHERE wt.twitter_handle = bw.twitter_handle ORDER BY wt.impressions DESC, wt.posted_at DESC LIMIT 1) as top_tweet_time
    FROM bag_workers bw
    ORDER BY bw.rank ASC;
  `);

  const cacheFile = path.join(__dirname, 'latest_workers.json');
  fs.writeFileSync(cacheFile, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    totalTweets: 42,
    totalWorkers: allRes.rows.length,
    cumulativeReach: allRes.rows.reduce((acc, r) => acc + Number(r.top_post_impressions || 0), 0),
    workers: allRes.rows.map(r => {
      const postsPts = Number(Math.min(30.0, r.posts_count * 1.5 + 5.0).toFixed(1));
      const streakPts = Number(Math.min(25.0, r.active_days * 5.0).toFixed(1));
      const reachPts = Number(Math.min(35.0, Math.log10(Math.max(10, Number(r.top_post_impressions))) * 7.5).toFixed(1));
      const consistencyPts = Number(Math.min(10.0, (r.consistency_score || 50) * 0.1).toFixed(1));

      return {
        rank: r.rank,
        twitterHandle: r.twitter_handle,
        displayName: r.display_name,
        avatarUrl: r.avatar_url,
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
        customTitle: r.custom_title,
        latestPostQuote: r.latest_post_quote,
        latestTweetUrl: r.top_tweet_url || `https://x.com/${r.twitter_handle}`,
        latestTweetTime: r.top_tweet_time,
        achievements: r.achievements,
      };
    })
  }, null, 2));

  console.log('[ENHANCE] Updated latest_workers.json cache successfully with all 21 workers!');
  await pool.end();
}

enhance().catch(console.error);
