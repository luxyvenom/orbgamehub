import { getPvpUser } from '@/lib/pvp-auth';
import { PVP_ROOM_TTL } from '@/lib/constants';
import { PvpRoom } from '@/lib/pvp-types';
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

function generateRoomCode(): string {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getPvpUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique room code (max 5 attempts)
    let roomId = '';
    for (let i = 0; i < 5; i++) {
      const code = generateRoomCode();
      const exists = await redis.exists(`room:${code}`);
      if (!exists) {
        roomId = code;
        break;
      }
    }

    if (!roomId) {
      return NextResponse.json({ error: 'Failed to generate room code' }, { status: 500 });
    }

    const now = Date.now();
    const room: PvpRoom = {
      roomId,
      status: 'waiting',
      p1_wallet: user.wallet,
      p1_username: user.username,
      p1_ready: false,
      p1_blinked: false,
      p1_blinkTime: null,
      p1_lastPing: now,
      p2_wallet: null,
      p2_username: null,
      p2_ready: false,
      p2_blinked: false,
      p2_blinkTime: null,
      p2_lastPing: now,
      gameStartTime: null,
      countdownStartTime: null,
      winner: null,
      winnerClaimed: false,
      p1_drawRefunded: false,
      p2_drawRefunded: false,
      createdAt: now,
    };

    await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });

    return NextResponse.json({ roomId, room });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
