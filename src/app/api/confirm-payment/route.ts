import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { transaction_id, reference } = await req.json();

    if (!transaction_id || !reference) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Verify with World Developer Portal
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transaction_id}?app_id=${process.env.NEXT_PUBLIC_APP_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      if (!process.env.DEV_PORTAL_API_KEY) {
        return NextResponse.json({ success: false, error: 'Payment verification not configured' }, { status: 500 });
      }
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 400 });
    }

    const transaction = await response.json();

    // Check reference matches and transaction didn't fail
    if (transaction.reference === reference && transaction.status !== 'failed') {
      return NextResponse.json({ success: true, transaction });
    }

    return NextResponse.json({ success: false, error: 'Reference mismatch or failed' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
