import { NextResponse } from 'next/server';
import { WALL_POSTS_INITIAL } from '@/lib/data';
import { validateWallContent } from '@/lib/wallValidation';

export async function GET() {
  return NextResponse.json({
    success: true,
    posts: WALL_POSTS_INITIAL,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, category, imageUrl, arcadeShowcase } = body;

    const validation = validateWallContent(content);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error, bannedTickers: validation.bannedTickers, bannedCAs: validation.bannedCAs },
        { status: 422 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json({ success: false, error: 'Transmission exceeds 500 characters' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Transmission verified and dispatched to network',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Malformed request' }, { status: 500 });
  }
}
