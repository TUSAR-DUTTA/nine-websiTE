/**
 * Automated Playwright Stealth Scraper for Social Bag Working Telemetry
 * Targets: X/Twitter search for $AI, $NINE, #RobinhoodChain, #PonsLaunchpad
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Configurable scraping targets
const SCRAPE_CONFIG = {
  searchQuery: '($AI OR $NINE) (Robinhood OR "Robinhood Chain" OR "Artificial Inu" OR Pons)',
  targetUrls: [
    'https://x.com/search?q=%28%24AI%20OR%20%24NINE%29%20%28Robinhood%20OR%20Pons%29&f=live',
    'https://x.com/search?q=%23RobinhoodChain%20%24AI&f=live',
  ],
  maxScrolls: 8,
  minDelayMs: 1500,
  maxDelayMs: 3500,
};

// Realistic User-Agent pool for stealth rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
];

function randomDelay(min = SCRAPE_CONFIG.minDelayMs, max = SCRAPE_CONFIG.maxDelayMs) {
  return new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

/**
 * Apply stealth evasion scripts to prevent anti-bot detection
 */
async function applyStealthEvasions(page) {
  await page.addInitScript(() => {
    // 1. Hide webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    // 2. Mock chrome object
    window.chrome = {
      runtime: {},
      app: {},
      loadTimes: () => {},
      csi: () => {},
    };

    // 3. Mock languages & plugins
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // 4. Mock notification permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });
}

/**
 * Calculate Bag Worker Score using 4-Factor Formula
 * Score = (Posts * 0.20) + (ActiveDays * 0.40) + (Log10(Impressions) * 4.5) + (Consistency * 0.20)
 */
function calculateBagWorkerScore(postsCount, activeDays, topImpressions, consistencyScore) {
  const pScore = Math.min(30, postsCount * 0.2);
  const aScore = Math.min(35, activeDays * 0.4);
  const impScore = topImpressions > 0 ? Math.min(25, Math.log10(Math.max(10, topImpressions)) * 4.5) : 5;
  const cScore = Math.min(10, consistencyScore * 0.2);
  
  const rawScore = pScore + aScore + impScore + cScore;
  return Number(Math.min(100, Math.max(10, rawScore)).toFixed(1));
}

/**
 * Main Scrape Function
 */
async function scrapeSocialBagWorkers() {
  console.log('====================================================');
  console.log('[SCRAPER] Initiating Stealth Social Tracker Session');
  console.log(`[SCRAPER] Timestamp: ${new Date().toISOString()}`);
  console.log('====================================================');

  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
    ],
  });

  const SESSION_FILE = path.join(__dirname, 'twitter_session.json');
  const hasSessionFile = fs.existsSync(SESSION_FILE);

  const context = await browser.newContext({
    storageState: hasSessionFile ? SESSION_FILE : undefined,
    userAgent,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  // Inject session cookies if provided in env and no storageState
  const authToken = process.env.TWITTER_AUTH_TOKEN;
  const ct0 = process.env.TWITTER_CT0;
  if (!hasSessionFile && authToken && ct0) {
    console.log('[SCRAPER] Injecting authenticated Twitter/X session cookies from env...');
    await context.addCookies([
      { name: 'auth_token', value: authToken, domain: '.x.com', path: '/' },
      { name: 'ct0', value: ct0, domain: '.x.com', path: '/' },
    ]);
  } else if (hasSessionFile) {
    console.log(`[SCRAPER] Loaded authenticated session state from ${SESSION_FILE}`);
  } else {
    console.log('[SCRAPER] Notice: No saved session or env cookies found. Running in unauthenticated stealth mode.');
  }

  const page = await context.newPage();
  await applyStealthEvasions(page);

  const collectedTweets = [];
  const workerAggregates = new Map();

  try {
    for (const url of SCRAPE_CONFIG.targetUrls) {
      console.log(`[SCRAPER] Navigating to: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await randomDelay(2000, 4000);

        // Scroll loop with humanized jitter
        for (let scroll = 0; scroll < SCRAPE_CONFIG.maxScrolls; scroll++) {
          console.log(`[SCRAPER] Scrolling timeline tranche #${scroll + 1}...`);

          // Extract visible tweet articles from DOM
          const rawTweets = await page.evaluate(() => {
            const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
            return articles.map((art) => {
              try {
                // Author handle & name
                const userElement = art.querySelector('div[data-testid="User-Name"]');
                const links = userElement ? Array.from(userElement.querySelectorAll('a')) : [];
                const handleLink = links.find((l) => l.getAttribute('href')?.startsWith('/'));
                const handle = handleLink ? handleLink.getAttribute('href').replace('/', '').split('/')[0] : '';
                const displayName = userElement ? userElement.querySelector('span')?.innerText || handle : handle;
                
                // Avatar image
                const img = art.querySelector('img[src*="profile_images"]');
                const avatarUrl = img ? img.getAttribute('src') : '';

                // Tweet text
                const textElem = art.querySelector('div[data-testid="tweetText"]');
                const text = textElem ? textElem.innerText : '';

                // Tweet link & ID
                const timeLink = art.querySelector('time')?.closest('a');
                const tweetUrl = timeLink ? `https://x.com${timeLink.getAttribute('href')}` : '';
                const tweetId = tweetUrl.split('/status/')[1]?.split('?')[0] || '';
                const timeStr = art.querySelector('time')?.getAttribute('datetime') || new Date().toISOString();

                // Public Metrics (Replies, Retweets, Likes, Views)
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
                
                // Views/Impressions selector
                const viewLink = art.querySelector('a[href*="/analytics"]');
                let impressions = 0;
                if (viewLink) {
                  const vTxt = viewLink.innerText.trim();
                  if (vTxt.includes('K')) impressions = Math.round(parseFloat(vTxt) * 1000);
                  else if (vTxt.includes('M')) impressions = Math.round(parseFloat(vTxt) * 1000000);
                  else impressions = parseInt(vTxt.replace(/,/g, ''), 10) || 0;
                }
                if (!impressions && (likes > 0 || retweets > 0)) {
                  // Conservative estimate if analytics button is hidden
                  impressions = Math.max(150, likes * 28 + retweets * 45);
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

          console.log(`[SCRAPER] Scraped ${rawTweets.length} tweets in this tranche.`);
          for (const t of rawTweets) {
            if (t.tweetId && !collectedTweets.some((x) => x.tweetId === t.tweetId)) {
              collectedTweets.push(t);

              // Aggregate by author
              const handleKey = t.handle.toLowerCase();
              if (!workerAggregates.has(handleKey)) {
                workerAggregates.set(handleKey, {
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

              const worker = workerAggregates.get(handleKey);
              worker.postsCount += 1;
              worker.totalLikes += t.likes;
              worker.totalRetweets += t.retweets;
              worker.totalImpressions += t.impressions;
              worker.topPostImpressions = Math.max(worker.topPostImpressions, t.impressions);
              worker.activeDaysSet.add(t.timeStr.slice(0, 10)); // YYYY-MM-DD
              worker.recentTweets.push({
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

          // Smooth humanized scroll down
          await page.evaluate(() => window.scrollBy({ top: 900 + Math.random() * 300, behavior: 'smooth' }));
          await randomDelay(1800, 3200);
        }
      } catch (navErr) {
        console.warn(`[SCRAPER] Warning during navigation to ${url}:`, navErr.message);
      }
    }
  } finally {
    await browser.close();
  }

  // Format into final Bag Worker structures
  const formattedWorkers = [];
  for (const [_, w] of workerAggregates.entries()) {
    const activeDays = Math.max(1, w.activeDaysSet.size);
    const consistencyScore = Math.min(100, Math.round((activeDays / 7) * 70 + (w.postsCount / 10) * 30));
    const score = calculateBagWorkerScore(w.postsCount, activeDays, w.topPostImpressions, consistencyScore);

    let customTitle = '🐈 BAG WORKER';
    if (score >= 90) customTitle = '👑 #1 TIMELINE WARRIOR';
    else if (w.topPostImpressions > 50000) customTitle = '🌪️ VIRAL MEME VANGUARD';
    else if (activeDays >= 5) customTitle = '💎 CONVICTION HOLDER';

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
      achievements: ['BAG WORKER', 'TIMELINE SUPPORTER', 'ROBINHOOD MEMER'],
      recentTweets: w.recentTweets.slice(0, 5),
    });
  }

  // Sort by highest Bag Worker Score
  formattedWorkers.sort((a, b) => b.bagWorkerScore - a.bagWorkerScore);
  formattedWorkers.forEach((w, idx) => {
    w.rank = idx + 1;
  });

  console.log(`[SCRAPER] Extracted ${collectedTweets.length} total tweets across ${formattedWorkers.length} unique bag workers.`);
  return { workers: formattedWorkers, tweets: collectedTweets };
}

module.exports = {
  scrapeSocialBagWorkers,
  calculateBagWorkerScore,
};
