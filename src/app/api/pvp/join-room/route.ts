import { getPvpUser } from '@/lib/pvp-auth';
import { PVP_ROOM_TTL } from '@/lib/constants';
import { PvpRoom } from '@/lib/pvp-types';
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await getPvpUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await req.json();
    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const code = roomId.trim();
    const raw = await redis.get(`room:${code}`);
    if (!raw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room: PvpRoom = typeof raw === 'string' ? JSON.parse(raw) : raw as PvpRoom;

    if (room.p1_wallet === user.wallet) {
      return NextResponse.json({ error: 'Cannot join your own room' }, { status: 400 });
    }

    // Room must be waiting
    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Room is no longer accepting players' }, { status: 400 });
    }

    // Already has p2
    if (room.p2_wallet) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    room.p2_wallet = user.wallet;
    room.p2_username = user.username;
    room.p2_lastPing = Date.now();
    room.status = 'ready_check';

    await redis.set(`room:${code}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });

    return NextResponse.json({ roomId: code, room });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
