import { NextResponse } from 'next/server';
import { FUMBLES_DATA, detectFumble } from '@/lib/data';
import { fetchRobinhoodChainLiveFumbles } from '@/lib/liveFumbles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchRobinhoodChainLiveFumbles();
    return NextResponse.json({
      success: true,
      source: 'ROBINHOOD_CHAIN_MAINNET',
      marketData: data.marketData,
      totalFumbles: data.fumbles.length,
      fumbles: data.fumbles,
    });
  } catch (err: any) {
    console.error('Failed to fetch Robinhood chain fumbles:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fumbles telemetry' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sellPriceUSD, highestSubsequentUSD, soldAmountUSD } = body;

    const analysis = detectFumble(
      Number(sellPriceUSD),
      Number(highestSubsequentUSD),
      Number(soldAmountUSD)
    );

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    );
  }
}
