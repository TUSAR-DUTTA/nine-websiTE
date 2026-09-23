-- =========================================================
-- SOCIAL BAG WORKERS DATABASE SCHEMA
-- PostgreSQL / Supabase / Neon / AWS RDS
-- =========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BAG WORKERS MASTER TABLE
CREATE TABLE IF NOT EXISTS bag_workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_handle VARCHAR(50) UNIQUE NOT NULL,
    wallet_address VARCHAR(42),                      -- Optional linked Robinhood Chain address (0x...)
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    twitter_followers INT DEFAULT 0,
    
    -- On-Chain Bag Telemetry
    token_balance NUMERIC(36, 18) DEFAULT 0,         -- Verified on-chain token balance ($nine)
    holding_since TIMESTAMP WITH TIME ZONE,
    
    -- Bag Worker Scoring Metrics
    bag_worker_score NUMERIC(5, 2) DEFAULT 0.00,     -- Score from 0.00 to 100.00
    rank INT DEFAULT 9999,
    posts_count INT DEFAULT 0,                       -- Total verified posts mentioning ticker
    active_days INT DEFAULT 0,                       -- Total unique active days
    top_post_impressions BIGINT DEFAULT 0,           -- Highest impression single post
    total_impressions BIGINT DEFAULT 0,              -- Cumulative impressions
    total_likes INT DEFAULT 0,
    total_retweets INT DEFAULT 0,
    consistency_score INT DEFAULT 50,                -- 0 to 100 consistency rating
    
    -- Persona & Badges
    custom_title VARCHAR(100) DEFAULT '🐈 BAG WORKER',
    achievements TEXT[] DEFAULT ARRAY['BAG WORKER']::TEXT[],
    latest_post_quote TEXT,
    
    -- Timestamps
    last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_bag_workers_score ON bag_workers (bag_worker_score DESC);
CREATE INDEX IF NOT EXISTS idx_bag_workers_rank ON bag_workers (rank ASC);
CREATE INDEX IF NOT EXISTS idx_bag_workers_handle ON bag_workers (twitter_handle);
CREATE INDEX IF NOT EXISTS idx_bag_workers_wallet ON bag_workers (wallet_address);

-- 2. WORKER TWEETS ARCHIVE TABLE
CREATE TABLE IF NOT EXISTS worker_tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tweet_id VARCHAR(64) UNIQUE NOT NULL,
    twitter_handle VARCHAR(50) NOT NULL REFERENCES bag_workers(twitter_handle) ON DELETE CASCADE,
    tweet_text TEXT NOT NULL,
    tweet_url TEXT NOT NULL,
    
    -- Metrics
    impressions BIGINT DEFAULT 0,
    likes INT DEFAULT 0,
    retweets INT DEFAULT 0,
    replies INT DEFAULT 0,
    
    -- Metadata
    has_media BOOLEAN DEFAULT FALSE,
    tickers_detected TEXT[] DEFAULT ARRAY['$nine']::TEXT[],
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_worker_tweets_handle ON worker_tweets (twitter_handle);
CREATE INDEX IF NOT EXISTS idx_worker_tweets_posted_at ON worker_tweets (posted_at DESC);

-- 3. HISTORICAL LEADERBOARD SNAPSHOTS (FOR COMEBACK & PROGRESS TRACKING)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_handle VARCHAR(50) NOT NULL REFERENCES bag_workers(twitter_handle) ON DELETE CASCADE,
    rank INT NOT NULL,
    bag_worker_score NUMERIC(5, 2) NOT NULL,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snapshots_handle_time ON leaderboard_snapshots (twitter_handle, snapshot_timestamp DESC);

-- 4. AUTO-UPDATE TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_bag_workers_updated_at ON bag_workers;
CREATE TRIGGER trigger_bag_workers_updated_at
BEFORE UPDATE ON bag_workers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- SQL UPSERT QUERIES (Used by Scraper Script)
-- =========================================================

-- Upsert a Bag Worker:
-- INSERT INTO bag_workers (
--     twitter_handle, display_name, avatar_url, twitter_followers,
--     bag_worker_score, posts_count, active_days, top_post_impressions,
--     total_impressions, total_likes, total_retweets, consistency_score,
--     latest_post_quote, last_scraped_at
-- ) VALUES (
--     $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
-- )
-- ON CONFLICT (twitter_handle) DO UPDATE SET
--     display_name = EXCLUDED.display_name,
--     avatar_url = COALESCE(EXCLUDED.avatar_url, bag_workers.avatar_url),
--     twitter_followers = EXCLUDED.twitter_followers,
--     bag_worker_score = EXCLUDED.bag_worker_score,
--     posts_count = EXCLUDED.posts_count,
--     active_days = EXCLUDED.active_days,
--     top_post_impressions = GREATEST(EXCLUDED.top_post_impressions, bag_workers.top_post_impressions),
--     total_impressions = EXCLUDED.total_impressions,
--     total_likes = EXCLUDED.total_likes,
--     total_retweets = EXCLUDED.total_retweets,
--     consistency_score = EXCLUDED.consistency_score,
--     latest_post_quote = EXCLUDED.latest_post_quote,
--     last_scraped_at = NOW();

-- Recalculate Ranks Query:
-- WITH Ranked AS (
--     SELECT id, ROW_NUMBER() OVER (ORDER BY bag_worker_score DESC) as new_rank
--     FROM bag_workers
-- )
-- UPDATE bag_workers
-- SET rank = Ranked.new_rank
-- FROM Ranked
-- WHERE bag_workers.id = Ranked.id;
