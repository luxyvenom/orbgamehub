import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { result, betAmount, gameTime } = await req.json();

    if (!process.env.DEV_PORTAL_API_KEY || !process.env.NEXT_PUBLIC_APP_ID) {
      return NextResponse.json({ success: true, demo: true });
    }

    const walletAddress = session?.user?.walletAddress;
    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'No wallet' }, { status: 400 });
    }

    const title = result === 'win'
      ? 'You Won!'
      : result === 'lose'
      ? 'You Blinked!'
      : 'Draw!';

    const message = result === 'win'
      ? `You stared down the AI for ${gameTime}s and won ${(betAmount * 2).toFixed(1)} WLD!`
      : result === 'lose'
      ? `You blinked at ${gameTime}s. Bet ${betAmount} WLD lost. Try again!`
      : `Both held for ${gameTime}s. Your ${betAmount} WLD has been returned.`;

    const response = await fetch(
      'https://developer.worldcoin.org/api/v2/minikit/send-notification',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_APP_ID,
          wallet_addresses: [walletAddress],
          title,
          message,
          mini_app_path: '/play/eye-fighter',
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
