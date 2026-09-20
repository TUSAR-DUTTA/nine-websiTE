/**
 * Interactive Twitter / X Authentication Session Saver
 * 
 * Mode 1: Automated Browser Login
 * - Launches a visible Chrome window to https://x.com/login
 * - You log in normally (handles 2FA/captchas)
 * - Automatically captures auth_token, ct0, and full storageState to twitter_session.json
 * 
 * Mode 2: Quick Cookie Paste
 * - Allows pasting auth_token and ct0 directly if you already have them
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SESSION_FILE = path.join(__dirname, 'twitter_session.json');
const ENV_FILE = path.join(__dirname, '.env');

function updateEnvFile(token, ct0) {
  let envContent = '';
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  }

  // Update or append TWITTER_AUTH_TOKEN
  if (envContent.includes('TWITTER_AUTH_TOKEN=')) {
    envContent = envContent.replace(/TWITTER_AUTH_TOKEN=.*(\r?\n|$)/, `TWITTER_AUTH_TOKEN=${token}\n`);
  } else {
    envContent += `\nTWITTER_AUTH_TOKEN=${token}\n`;
  }

  // Update or append TWITTER_CT0
  if (envContent.includes('TWITTER_CT0=')) {
    envContent = envContent.replace(/TWITTER_CT0=.*(\r?\n|$)/, `TWITTER_CT0=${ct0}\n`);
  } else {
    envContent += `TWITTER_CT0=${ct0}\n`;
  }

  fs.writeFileSync(ENV_FILE, envContent.trim() + '\n', 'utf-8');
  console.log(`[SESSION] Updated ${ENV_FILE} with authenticated Twitter credentials.`);
}

async function startInteractiveBrowserLogin() {
  console.log('\n===============================================================');
  console.log('🐈 TWITTER / X AUTHENTICATION SESSION SAVER (Playwright)');
  console.log('===============================================================');
  console.log('1. A visible Chrome browser window will now open at https://x.com/login.');
  console.log('2. Log in to your Twitter / X account in that window.');
  console.log('3. Complete any 2FA verification if prompted.');
  console.log('4. Once you are logged in (Home feed loads), this script will');
  console.log('   automatically capture your session and save it permanently!');
  console.log('===============================================================\n');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    viewport: null, // use full screen
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('[SESSION] Navigating to https://x.com/login ...');
  await page.goto('https://x.com/login');

  console.log('[SESSION] Waiting for you to log in... (Checking every 2 seconds)');

  let isSaved = false;

  // Poll for authentication cookies
  const checkInterval = setInterval(async () => {
    try {
      const cookies = await context.cookies('https://x.com');
      const authTokenCookie = cookies.find((c) => c.name === 'auth_token');
      const ct0Cookie = cookies.find((c) => c.name === 'ct0');

      if (authTokenCookie && ct0Cookie && !isSaved) {
        isSaved = true;
        clearInterval(checkInterval);

        console.log('\n🎉 [SUCCESS] Detected authenticated Twitter / X session!');
        console.log(`[SESSION] Auth Token: ${authTokenCookie.value.slice(0, 8)}...${authTokenCookie.value.slice(-6)}`);
        console.log(`[SESSION] CT0 CSRF Token: ${ct0Cookie.value.slice(0, 8)}...`);

        // Save Playwright storageState (cookies + localStorage)
        await context.storageState({ path: SESSION_FILE });
        console.log(`[SESSION] Full browser session saved to: ${SESSION_FILE}`);

        // Also update .env
        updateEnvFile(authTokenCookie.value, ct0Cookie.value);

        console.log('\n===============================================================');
        console.log('✅ SESSION READY! Your automated 6-hour scraper is now authenticated.');
        console.log('You can now close the browser window or press Ctrl+C.');
        console.log('===============================================================\n');

        setTimeout(async () => {
          await browser.close();
          process.exit(0);
        }, 3000);
      }
    } catch (e) {
      // Browser might have been closed by user
    }
  }, 2000);

  // Safety timeout: 10 minutes
  setTimeout(async () => {
    if (!isSaved) {
      clearInterval(checkInterval);
      console.warn('[SESSION] Login session timed out after 10 minutes.');
      try { await browser.close(); } catch {}
      process.exit(1);
    }
  }, 600000);
}

// Check command line arguments for manual cookie entry: node save_twitter_session.js --manual
const args = process.argv.slice(2);
if (args.includes('--manual')) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter auth_token: ', (token) => {
    rl.question('Enter ct0: ', (ct0) => {
      updateEnvFile(token.trim(), ct0.trim());
      rl.close();
      console.log('Session credentials saved successfully.');
    });
  });
} else {
  startInteractiveBrowserLogin().catch(console.error);
}
