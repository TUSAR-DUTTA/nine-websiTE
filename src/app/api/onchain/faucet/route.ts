import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Protocol faucet is disabled on Robinhood Chain Mainnet.' },
    { status: 400 }
  );
}
