import { getPvpUser } from '@/lib/pvp-auth';
import { PVP_DRAW_THRESHOLD, PVP_ROOM_TTL } from '@/lib/constants';
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

    // Accept blinks during 'playing' or 'countdown' (if gameStartTime has passed)
    if (room.status === 'playing') {
      // OK
    } else if (room.status === 'countdown' && room.gameStartTime && Date.now() >= room.gameStartTime) {
      // Countdown expired but room-status hasn't polled yet to transition — treat as playing
      room.status = 'playing';
    } else {
      return NextResponse.json({ error: 'Game is not in playing phase' }, { status: 400 });
    }

    if (room.winner) {
      return NextResponse.json({ room });
    }

    const now = Date.now();
    const blinkTime = room.gameStartTime ? (now - room.gameStartTime) / 1000 : 0;

    // TEST MODE: support ?role=p2 for same-user testing
    const url = new URL(req.url);
    const forceRole = url.searchParams.get('role');

    if (forceRole === 'p2' && room.p2_wallet === user.wallet) {
      if (room.p2_blinked) return NextResponse.json({ room });
      room.p2_blinked = true;
      room.p2_blinkTime = blinkTime;
    } else if (room.p1_wallet === user.wallet && forceRole !== 'p2') {
      if (room.p1_blinked) return NextResponse.json({ room });
      room.p1_blinked = true;
      room.p1_blinkTime = blinkTime;
    } else if (room.p2_wallet === user.wallet) {
      if (room.p2_blinked) return NextResponse.json({ room });
      room.p2_blinked = true;
      room.p2_blinkTime = blinkTime;
    } else {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    // Determine winner
    if (room.p1_blinked && room.p2_blinked) {
      const diff = Math.abs((room.p1_blinkTime ?? 0) - (room.p2_blinkTime ?? 0));
      if (diff <= PVP_DRAW_THRESHOLD) {
        room.winner = 'draw';
      } else if ((room.p1_blinkTime ?? 0) < (room.p2_blinkTime ?? 0)) {
        room.winner = 'p2';
      } else {
        room.winner = 'p1';
      }
      room.status = 'finished';
    } else if (room.p1_blinked && !room.p2_blinked) {
      room.winner = 'p2';
      room.status = 'finished';
    } else if (!room.p1_blinked && room.p2_blinked) {
      room.winner = 'p1';
      room.status = 'finished';
    }

    await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
