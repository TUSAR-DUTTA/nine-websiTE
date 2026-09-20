import { NextResponse } from 'next/server';
import { LIVE_FEED_ITEMS } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    success: true,
    feed: LIVE_FEED_ITEMS,
    streamId: 'STREAM_NINE_LIVES_MAIN',
  });
}
