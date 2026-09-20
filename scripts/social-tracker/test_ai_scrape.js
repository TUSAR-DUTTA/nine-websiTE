/**
 * Targeted Test Script for $AI (Artificial Inu on Robinhood Chain)
 * Scrapes real tweets using the saved Twitter session and pushes to Supabase!
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { chromium } = require('playwright');
const { pushWorkersToDatabase } = require('./db');

const SESSION_FILE = path.join(__dirname, 'twitter_session.json');

// Real search queries for Artificial Inu / $AI on Robinhood Chain
const AI_SEARCH_URLS = [
  'https://x.com/search?q=%24AI%20Robinhood&f=live',
  'https://x.com/search?q=%22Artificial%20Inu%22&f=live',
  'https://x.com/search?q=%23RobinhoodChain%20%24AI&f=live',
];

function calculateBagWorkerScore(postsCount, activeDays, topImpressions, consistencyScore) {
  const pScore = Math.min(30, postsCount * 0.2);
  const aScore = Math.min(35, activeDays * 0.4);
  const impScore = topImpressions > 0 ? Math.min(25, Math.log10(Math.max(10, topImpressions)) * 4.5) : 5;
  const cScore = Math.min(10, consistencyScore * 0.2);
  return Number(Math.min(100, Math.max(10, pScore + aScore + impScore + cScore)).toFixed(1));
}

async function runTestAIScrape() {
  console.log('===============================================================');
  console.log('🐕 TESTING $AI TICKER (Artificial Inu - Robinhood Chain)');
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
    for (const url of AI_SEARCH_URLS) {
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
                  impressions = Math.max(120, likes * 24 + retweets * 40);
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

          console.log(`  -> Tranche #${scroll + 1}: Found ${tweetsOnPage.length} tweets mentioning $AI`);

          for (const t of tweetsOnPage) {
            if (t.tweetId && !collectedTweets.some((x) => x.tweetId === t.tweetId)) {
              collectedTweets.push(t);
              const key = t.handle.toLowerCase();
              if (!workerMap.has(key)) {
                workerMap.set(key, {
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

              const w = workerMap.get(key);
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

          await page.evaluate(() => window.scrollBy({ top: 900, behavior: 'smooth' }));
          await new Promise((r) => setTimeout(r, 2500));
        }
      } catch (err) {
        console.warn(`  Warning scraping ${url}:`, err.message);
      }
    }
  } finally {
    await browser.close();
  }

  // Format into Bag Workers array
  const formattedWorkers = [];
  for (const [_, w] of workerMap.entries()) {
    const activeDays = Math.max(1, w.activeDaysSet.size);
    const consistencyScore = Math.min(100, Math.round((activeDays / 7) * 70 + (w.postsCount / 10) * 30));
    const score = calculateBagWorkerScore(w.postsCount, activeDays, w.topPostImpressions, consistencyScore);

    let customTitle = '🐕 $AI BAG WORKER';
    if (score >= 90) customTitle = '👑 #1 $AI TIMELINE WARRIOR';
    else if (w.topPostImpressions > 50000) customTitle = '🌪️ VIRAL $AI MEMER';
    else if (w.totalRetweets > 20) customTitle = '⚡ $AI RAID LEADER';

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
      achievements: ['$AI HOLDER', 'ROBINHOOD MEMER', 'BAG WORKER'],
      recentTweets: w.recentTweets.slice(0, 5),
    });
  }

  formattedWorkers.sort((a, b) => b.bagWorkerScore - a.bagWorkerScore);
  formattedWorkers.forEach((w, idx) => {
    w.rank = idx + 1;
  });

  console.log(`\n[3/4] Successfully extracted ${collectedTweets.length} live $AI tweets across ${formattedWorkers.length} unique bag workers.`);

  if (formattedWorkers.length > 0) {
    console.log('\nTop 3 $AI Bag Workers Discovered on X:');
    formattedWorkers.slice(0, 3).forEach((w) => {
      console.log(`  #${w.rank} @${w.twitterHandle} - Score: ${w.bagWorkerScore} | Posts: ${w.postsCount} | Reach: ${w.topPostImpressions} views`);
    });

    console.log('\n[4/4] Pushing live $AI bag workers to Supabase PostgreSQL database...');
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

runTestAIScrape().catch(console.error);
