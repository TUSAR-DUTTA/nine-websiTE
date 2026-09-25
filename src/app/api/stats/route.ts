import { NextResponse } from 'next/server';
import { TOKEN_INFO, INITIAL_PULSE } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      token: TOKEN_INFO,
      pulse: INITIAL_PULSE,
      serverTime: new Date().toISOString(),
      network: 'Robinhood Chain (Mainnet 4663)',
      rpcStatus: 'HEALTHY',
    },
  });
}
