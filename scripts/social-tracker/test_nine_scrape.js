/**
 * Targeted Test Script for $nine (Nine The Cat - @NineDcat)
 * Scrapes real tweets from https://x.com/NineDcat and searches for $nine & "nine the cat"
 * using the saved Twitter session and pushes to Supabase!
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { chromium } = require('playwright');
const { pushWorkersToDatabase } = require('./db');

const SESSION_FILE = path.join(__dirname, 'twitter_session.json');

// Dedicated search queries & target URLs for $nine, Nine The Cat, and @NineDcat
const NINE_SEARCH_URLS = [
  'https://x.com/NineDcat',
  'https://x.com/search?q=%28%24nine%20OR%20%22nine%20the%20cat%22%20OR%20%40NineDcat%29&f=live',
  'https://x.com/search?q=%40NineDcat&f=live',
  'https://x.com/search?q=%24nine&f=live',
];

function calculateBagWorkerScore(postsCount, activeDays, topImpressions, consistencyScore) {
  const pScore = Math.min(30, postsCount * 0.2);
  const aScore = Math.min(35, activeDays * 0.4);
  const impScore = topImpressions > 0 ? Math.min(25, Math.log10(Math.max(10, topImpressions)) * 4.5) : 5;
  const cScore = Math.min(10, consistencyScore * 0.2);
  return Number(Math.min(100, Math.max(10, pScore + aScore + impScore + cScore)).toFixed(1));
}

async function runTestNineScrape() {
  console.log('===============================================================');
  console.log('🐈 TESTING $NINE TICKER (@NineDcat - Nine The Cat)');
  console.log('Official Account: https://x.com/NineDcat');
  console.log('Search Query: ($nine OR "nine the cat" OR @NineDcat)');
  console.log('===============================================================');

  if (!fs.existsSync(SESSION_FILE)) {
    console.error('ERROR: twitter_session.json not found! Run save_twitter_session.js first.');
    process.exit(1);
  }

  console.log('[1/4] Launching Playwright Stealth with saved Twitter session...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const context = await browser.newContext({
    storageState: SESSION_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Stealth evasions
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {}, app: {}, loadTimes: () => {}, csi: () => {} };
  });

  const collectedTweets = [];
  const workerMap = new Map();

  try {
    for (const url of NINE_SEARCH_URLS) {
      console.log(`\n[2/4] Searching X/Twitter: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise((r) => setTimeout(r, 4000));

        // Scroll 4 tranches
        for (let scroll = 0; scroll < 4; scroll++) {
          const tweetsOnPage = await page.evaluate(() => {
            const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
            return articles.map((art) => {
              try {
                const userElement = art.querySelector('div[data-testid="User-Name"]');
                const links = userElement ? Array.from(userElement.querySelectorAll('a')) : [];
                const handleLink = links.find((l) => l.getAttribute('href')?.startsWith('/'));
                const handle = handleLink ? handleLink.getAttribute('href').replace('/', '').split('/')[0] : '';
                const displayName = userElement ? userElement.querySelector('span')?.innerText || handle : handle;

                const img = art.querySelector('img[src*="profile_images"]');
                const avatarUrl = img ? img.getAttribute('src') : '';

                const textElem = art.querySelector('div[data-testid="tweetText"]');
                const text = textElem ? textElem.innerText : '';

                const timeLink = art.querySelector('time')?.closest('a');
                const tweetUrl = timeLink ? `https://x.com${timeLink.getAttribute('href')}` : '';
                const tweetId = tweetUrl.split('/status/')[1]?.split('?')[0] || '';
                const timeStr = art.querySelector('time')?.getAttribute('datetime') || new Date().toISOString();

                // Metrics
                const getMetric = (testId) => {
                  const el = art.querySelector(`div[data-testid="${testId}"]`);
                  if (!el) return 0;
                  const txt = el.innerText.trim();
                  if (!txt) return 0;
                  if (txt.includes('K')) return Math.round(parseFloat(txt) * 1000);
                  if (txt.includes('M')) return Math.round(parseFloat(txt) * 1000000);
                  return parseInt(txt.replace(/,/g, ''), 10) || 0;
                };

                const replies = getMetric('reply');
                const retweets = getMetric('retweet');
                const likes = getMetric('like');

                const viewLink = art.querySelector('a[href*="/analytics"]');
                let impressions = 0;
                if (viewLink) {
                  const vTxt = viewLink.innerText.trim();
                  if (vTxt.includes('K')) impressions = Math.round(parseFloat(vTxt) * 1000);
                  else if (vTxt.includes('M')) impressions = Math.round(parseFloat(vTxt) * 1000000);
                  else impressions = parseInt(vTxt.replace(/,/g, ''), 10) || 0;
                }
                if (!impressions && (likes > 0 || retweets > 0)) {
                  impressions = Math.max(120, likes * 25 + retweets * 40);
                }

                return {
                  handle,
                  displayName,
                  avatarUrl,
                  text,
                  tweetUrl,
                  tweetId,
                  timeStr,
                  replies,
                  retweets,
                  likes,
                  impressions,
                };
              } catch (e) {
                return null;
              }
            }).filter((t) => t && t.handle && t.text);
          });

          console.log(`  Tranche #${scroll + 1}: Found ${tweetsOnPage.length} tweets`);

          for (const t of tweetsOnPage) {
            if (t.tweetId && !collectedTweets.some((x) => x.tweetId === t.tweetId)) {
              collectedTweets.push(t);

              const handleKey = t.handle.toLowerCase();
              if (!workerMap.has(handleKey)) {
                workerMap.set(handleKey, {
                  twitterHandle: t.handle,
                  displayName: t.displayName,
                  avatarUrl: t.avatarUrl || '/assets/mascot/mascot_head_favicon.webp',
                  postsCount: 0,
                  totalLikes: 0,
                  totalRetweets: 0,
                  totalImpressions: 0,
                  topPostImpressions: 0,
                  latestPostQuote: t.text.slice(0, 140),
                  recentTweets: [],
                  activeDaysSet: new Set(),
                });
              }

              const w = workerMap.get(handleKey);
              w.postsCount += 1;
              w.totalLikes += t.likes;
              w.totalRetweets += t.retweets;
              w.totalImpressions += t.impressions;
              w.topPostImpressions = Math.max(w.topPostImpressions, t.impressions);
              w.activeDaysSet.add(t.timeStr.slice(0, 10));
              w.recentTweets.push({
                tweetId: t.tweetId,
                text: t.text,
                url: t.tweetUrl,
                likes: t.likes,
                retweets: t.retweets,
                replies: t.replies,
                impressions: t.impressions,
                postedAt: t.timeStr,
              });
            }
          }

          // Scroll down smoothly
          await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' }));
          await new Promise((r) => setTimeout(r, 2500));
        }
      } catch (err) {
        console.warn(`  Failed navigating to ${url}: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  // Format workers
  const formattedWorkers = [];
  for (const [_, w] of workerMap.entries()) {
    const activeDays = Math.max(1, w.activeDaysSet.size);
    const consistencyScore = Math.min(100, Math.round((activeDays / 7) * 70 + (w.postsCount / 10) * 30));
    const score = calculateBagWorkerScore(w.postsCount, activeDays, w.topPostImpressions, consistencyScore);

    let customTitle = '🐈 $NINE BAG WORKER';
    if (w.twitterHandle.toLowerCase() === 'ninedcat') customTitle = '👑 OFFICIAL $NINE MASCOT / DEV';
    else if (score >= 90) customTitle = '👑 #1 $NINE TIMELINE WARRIOR';
    else if (w.topPostImpressions > 50000) customTitle = '🌪️ VIRAL $NINE MEMER';
    else if (w.totalRetweets > 20) customTitle = '⚡ $NINE RAID LEADER';

    formattedWorkers.push({
      twitterHandle: w.twitterHandle,
      displayName: w.displayName,
      avatarUrl: w.avatarUrl,
      bagWorkerScore: score,
      postsCount: w.postsCount,
      activeDays: activeDays,
      topPostImpressions: w.topPostImpressions,
      totalImpressions: w.totalImpressions,
      totalLikes: w.totalLikes,
      totalRetweets: w.totalRetweets,
      consistencyScore: consistencyScore,
      customTitle: customTitle,
      latestPostQuote: `"${w.latestPostQuote}"`,
      achievements: ['$NINE HOLDER', 'NINE THE CAT', 'BAG WORKER'],
      recentTweets: w.recentTweets.slice(0, 5),
    });
  }

  formattedWorkers.sort((a, b) => b.bagWorkerScore - a.bagWorkerScore);
  formattedWorkers.forEach((w, idx) => {
    w.rank = idx + 1;
  });

  console.log(`\n[3/4] Successfully extracted ${collectedTweets.length} live $nine tweets across ${formattedWorkers.length} unique bag workers.`);

  if (formattedWorkers.length > 0) {
    console.log('\nTop 3 $NINE Bag Workers Discovered on X:');
    formattedWorkers.slice(0, 3).forEach((w) => {
      console.log(`  #${w.rank} @${w.twitterHandle} - Score: ${w.bagWorkerScore} | Posts: ${w.postsCount} | Reach: ${w.topPostImpressions} views`);
    });

    console.log('\n[4/4] Pushing live $nine bag workers to Supabase PostgreSQL database...');
    await pushWorkersToDatabase(formattedWorkers);
    console.log('✅ SUPABASE SYNC COMPLETE! Live database updated.');

    // Save local cache snapshot as well
    const cachePath = path.join(__dirname, 'latest_workers.json');
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ lastUpdated: new Date().toISOString(), totalTweets: collectedTweets.length, workers: formattedWorkers }, null, 2)
    );
  } else {
    console.log('\n[!] 0 tweets found on timeline. Twitter may have throttled or query returned empty.');
  }

  console.log('\n===============================================================');
  console.log('Test completed successfully!');
  console.log('===============================================================\n');
}

runTestNineScrape().catch(console.error);
