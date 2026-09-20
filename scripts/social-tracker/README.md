# 🐈 Social Bag Worker Automation (Playwright Stealth + PostgreSQL)

This system runs an automated stealth browser scraper every **6 hours** that tracks community members shilling, meming, and working the bag for `$AI` / `$NINE` on X (Twitter), calculates their **Bag Worker Score**, and pushes the ranked telemetry into your database.

---

## 🔑 1. Credentials & Configuration Needed

### A. Database Credentials (PostgreSQL / Supabase / Neon)
You need a PostgreSQL database. You can use a free cloud instance from **Supabase** or **Neon**:
- `DATABASE_URL`: The full PostgreSQL connection string:
  ```env
  DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
  ```
  *(Or standard host/user/pass: `postgresql://user:password@localhost:5432/nineterminal`)*

### B. Twitter / X Session Cookies (Bypasses Login Blockers)
Twitter blocks unauthenticated search queries. By providing session cookies, Playwright browses `x.com` as an authenticated user with 0 API fees:
- `TWITTER_AUTH_TOKEN`: The `auth_token` cookie value from `x.com`.
- `TWITTER_CT0`: The `ct0` cookie value from `x.com`.

> **How to get these in 15 seconds:**
> 1. Open [x.com](https://x.com) in your browser where you are logged in.
> 2. Press `F12` (Developer Tools) $\to$ Go to **Application** tab $\to$ **Cookies** $\to$ `https://x.com`.
> 3. Copy the values for `auth_token` and `ct0` into `.env`.

---

## 🛠️ 2. Setup & Installation

### Step 1: Install Dependencies
From the project root:
```bash
npm install playwright pg dotenv
# Install the Chromium browser binary for Playwright
npx playwright install chromium
```

### Step 2: Initialize the Database Schema
Execute the SQL script in your database:
```bash
# If using psql CLI:
psql $DATABASE_URL -f scripts/social-tracker/schema.sql

# If using Supabase or Neon:
# Simply copy and paste the contents of scripts/social-tracker/schema.sql into the Supabase SQL Editor and click "Run".
```

### Step 3: Configure `.env`
Create a `.env` file in `scripts/social-tracker/` (or in project root):
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
TWITTER_AUTH_TOKEN=your_auth_token
TWITTER_CT0=your_ct0
HEADLESS=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 3. Running the Automation

### Run Once (Test Cycle):
```bash
node scripts/social-tracker/scraper.js
```

### Run 6-Hour Automated Daemon:
```bash
node scripts/social-tracker/runner.js
```
*(Or run with PM2: `pm2 start scripts/social-tracker/runner.js --name "nine-bag-tracker"`)*

---

## 📊 4. How the Scoring Engine Works
Every worker is evaluated using the 4-factor formula:
$$\text{Score (0-100)} = (\text{Posts} \times 0.20) + (\text{Active Days} \times 0.40) + (\log_{10}(\text{Impressions}) \times 4.5) + (\text{Consistency} \times 0.20)$$

- **Posting Frequency (30 pts max)**: Verified posts with `$AI`, `$NINE`, `#RobinhoodChain`.
- **Active Days (35 pts max)**: Rewards sustained daily community presence over 1-day spam.
- **Impressions (25 pts max)**: Algorithmic reach and timeline penetration.
- **Consistency (10 pts max)**: Unbroken engagement streak.
