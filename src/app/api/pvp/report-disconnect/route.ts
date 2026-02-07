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
    if (!roomId) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const raw = await redis.get(`room:${roomId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room: PvpRoom = typeof raw === 'string' ? JSON.parse(raw) : raw as PvpRoom;

    const isP1 = room.p1_wallet === user.wallet;
    const isP2 = room.p2_wallet === user.wallet;

    if (!isP1 && !isP2) {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    if (room.status === 'finished') {
      return NextResponse.json({ room });
    }

    if (room.status === 'waiting') {
      await redis.del(`room:${roomId}`);
      return NextResponse.json({ deleted: true });
    }

    if (room.status === 'playing') {
      room.winner = isP1 ? 'p2' : 'p1';
      room.status = 'finished';
    } else {
      if (isP2) {
        room.p2_wallet = null;
        room.p2_username = null;
        room.p2_ready = false;
        room.status = 'waiting';
      } else {
        room.status = 'finished';
        room.winner = room.p2_wallet ? 'p2' : null;
      }
    }

    await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
