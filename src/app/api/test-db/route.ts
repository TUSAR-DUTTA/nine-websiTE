import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({
      connected: false,
      reason: 'DATABASE_URL environment variable is NOT set in Vercel.',
      hint: 'Please add DATABASE_URL in Vercel Project Settings -> Environment Variables and redeploy.',
    });
  }

  // Sanitize host for display without exposing password
  let host = 'unknown';
  try {
    const url = new URL(dbUrl);
    host = `${url.hostname}:${url.port || 5432}`;
  } catch (e) {
    host = 'invalid_url_format';
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    max: 1,
  });

  try {
    const res = await pool.query('SELECT count(*) as count FROM bag_workers;');
    await pool.end();
    return NextResponse.json({
      connected: true,
      host,
      bagWorkersCount: Number(res.rows[0].count),
      message: 'Supabase PostgreSQL is successfully connected to Vercel production!',
    });
  } catch (err: any) {
    try {
      await pool.end();
    } catch {}
    return NextResponse.json({
      connected: false,
      host,
      error: err.message,
      code: err.code || null,
      message: 'DATABASE_URL is set, but connection to Supabase failed.',
    });
  }
}
