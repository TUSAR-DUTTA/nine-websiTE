/**
 * 6-Hour Automated Cron Runner for Social Bag Workers
 * Executes Playwright stealth scraping every 6 hours and pushes to PostgreSQL & Local API
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { scrapeSocialBagWorkers } = require('./scraper');
const { pushWorkersToDatabase } = require('./db');

const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const LATEST_CACHE_FILE = path.join(__dirname, 'latest_workers.json');

async function runSocialTrackingCycle() {
  console.log('\n======================================================');
  console.log(`[CYCLE] Starting automated 6-hour scrape cycle at ${new Date().toLocaleString()}`);
  console.log('======================================================');

  try {
    // 1. Scrape latest data via Playwright Stealth
    const { workers, tweets } = await scrapeSocialBagWorkers();

    if (workers.length > 0) {
      // 2. Save local fallback JSON cache
      fs.writeFileSync(
        LATEST_CACHE_FILE,
        JSON.stringify({ lastUpdated: new Date().toISOString(), workers, totalTweets: tweets.length }, null, 2)
      );
      console.log(`[CYCLE] Saved local cache snapshot to ${LATEST_CACHE_FILE}`);

      // 3. Push to PostgreSQL if DATABASE_URL configured
      if (process.env.DATABASE_URL) {
        try {
          await pushWorkersToDatabase(workers);
          console.log('[CYCLE] Successfully synced records to PostgreSQL database.');
        } catch (dbErr) {
          console.error('[CYCLE] Database sync error:', dbErr.message);
        }
      } else {
        console.log('[CYCLE] No DATABASE_URL set. Stored in local JSON snapshot.');
      }

      // 4. Ping Next.js Local API webhook if active
      try {
        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/bag-workers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.CRON_SECRET ? { Authorization: `Bearer ${process.env.CRON_SECRET}` } : {}),
          },
          body: JSON.stringify({ workers }),
        });
        if (res.ok) {
          console.log('[CYCLE] Live API notified and updated successfully.');
        }
      } catch (apiErr) {
        // Local server might be starting up, non-critical
      }
    } else {
      console.warn('[CYCLE] Scraper returned 0 workers. Check query or network.');
    }
  } catch (err) {
    console.error('[CYCLE] Error during scrape execution:', err);
  }

  const nextRun = new Date(Date.now() + INTERVAL_MS);
  console.log(`[CYCLE] Cycle complete. Next automated scrape scheduled for: ${nextRun.toLocaleString()}\n`);
}

const isOnce = process.argv.includes('--once');

// Start immediately on launch
runSocialTrackingCycle().then(() => {
  if (isOnce) {
    console.log('[RUNNER] Single cycle execution complete (--once). Exiting cleanly.');
    process.exit(0);
  }
});

// Set 6-hour interval loop if daemon mode
if (!isOnce) {
  setInterval(runSocialTrackingCycle, INTERVAL_MS);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('[RUNNER] Gracefully stopping 6-hour tracking scheduler...');
  process.exit(0);
});

