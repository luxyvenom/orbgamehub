import { getPvpUser } from '@/lib/pvp-auth';
import { PVP_COUNTDOWN_SECONDS, PVP_ROOM_TTL } from '@/lib/constants';
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
    if (!roomId) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const raw = await redis.get(`room:${roomId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room: PvpRoom = typeof raw === 'string' ? JSON.parse(raw) : raw as PvpRoom;

    if (room.status !== 'ready_check') {
      return NextResponse.json({ error: 'Room is not in ready check phase' }, { status: 400 });
    }

    // Determine which player by wallet address
    let whichPlayer: 'p1' | 'p2';
    if (room.p1_wallet === user.wallet) {
      whichPlayer = 'p1';
    } else if (room.p2_wallet === user.wallet) {
      whichPlayer = 'p2';
    } else {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    // Store ready in a separate key to avoid race conditions.
    // Two players sending ready simultaneously would overwrite each other
    // if we read-modify-write the entire room object.
    await redis.set(`room:${roomId}:ready:${whichPlayer}`, '1', { ex: PVP_ROOM_TTL });

    // Re-read room for the latest state (avoids overwriting join data, etc.)
    const freshRaw = await redis.get(`room:${roomId}`);
    if (!freshRaw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const freshRoom: PvpRoom = typeof freshRaw === 'string' ? JSON.parse(freshRaw) : freshRaw as PvpRoom;

    // Merge ready flags from separate keys
    const [r1, r2] = await Promise.all([
      redis.get(`room:${roomId}:ready:p1`),
      redis.get(`room:${roomId}:ready:p2`),
    ]);
    if (r1) freshRoom.p1_ready = true;
    if (r2) freshRoom.p2_ready = true;

    // Both ready → start countdown
    if (freshRoom.p1_ready && freshRoom.p2_ready && freshRoom.status === 'ready_check') {
      const now = Date.now();
      freshRoom.status = 'countdown';
      freshRoom.countdownStartTime = now;
      freshRoom.gameStartTime = now + PVP_COUNTDOWN_SECONDS * 1000;
    }

    await redis.set(`room:${roomId}`, JSON.stringify(freshRoom), { ex: PVP_ROOM_TTL });

    return NextResponse.json({ room: freshRoom });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
