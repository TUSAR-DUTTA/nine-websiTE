const { pushWorkersToDatabase } = require('./db');
const fs = require('fs');
const path = require('path');

process.env.DATABASE_URL = "postgresql://postgres.ptthcotrpsxgeujskcpx:9854816330%40@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";

async function seed() {
  const cacheFile = path.join(__dirname, 'latest_workers.json');
  const fileData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  console.log(`[SEED] Seeding ${fileData.workers.length} workers to Supabase...`);
  await pushWorkersToDatabase(fileData.workers);
  console.log('[SEED] Done!');
}

seed().catch(console.error);
