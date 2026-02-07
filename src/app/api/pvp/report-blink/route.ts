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
      room.status = 'playing';
    } else if (room.status === 'finished') {
      return NextResponse.json({ room });
    } else {
      return NextResponse.json({ error: 'Game is not in playing phase' }, { status: 400 });
    }

    if (room.winner) {
      return NextResponse.json({ room });
    }

    const now = Date.now();
    const blinkTime = room.gameStartTime ? (now - room.gameStartTime) / 1000 : 0;

    // Determine role by wallet address
    let myRole: 'p1' | 'p2';
    if (room.p1_wallet === user.wallet) {
      myRole = 'p1';
    } else if (room.p2_wallet === user.wallet) {
      myRole = 'p2';
    } else {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    // Store blink in a SEPARATE key (atomic, no race condition)
    const blinkKey = `blink:${roomId}:${myRole}`;
    await redis.set(blinkKey, String(blinkTime), { ex: PVP_ROOM_TTL });

    // Wait briefly for concurrent blink from other player (same-camera testing)
    await new Promise(r => setTimeout(r, 200));

    // Read both blink keys (race-safe)
    const p1BlinkStr = await redis.get(`blink:${roomId}:p1`);
    const p2BlinkStr = await redis.get(`blink:${roomId}:p2`);
    const p1Blink = p1BlinkStr ? Number(p1BlinkStr) : null;
    const p2Blink = p2BlinkStr ? Number(p2BlinkStr) : null;

    // Re-read room (might have been updated by concurrent request)
    const freshRaw = await redis.get(`room:${roomId}`);
    const freshRoom: PvpRoom = typeof freshRaw === 'string' ? JSON.parse(freshRaw) : freshRaw as PvpRoom;
    if (freshRoom.winner) {
      return NextResponse.json({ room: freshRoom });
    }

    // Determine winner based on both blink keys
    if (p1Blink !== null && p2Blink !== null) {
      const diff = Math.abs(p1Blink - p2Blink);
      freshRoom.p1_blinked = true;
      freshRoom.p2_blinked = true;
      freshRoom.p1_blinkTime = p1Blink;
      freshRoom.p2_blinkTime = p2Blink;
      if (diff <= PVP_DRAW_THRESHOLD) {
        freshRoom.winner = 'draw';
      } else if (p1Blink < p2Blink) {
        freshRoom.winner = 'p2';
      } else {
        freshRoom.winner = 'p1';
      }
    } else if (p1Blink !== null) {
      freshRoom.p1_blinked = true;
      freshRoom.p1_blinkTime = p1Blink;
      freshRoom.winner = 'p2';
    } else if (p2Blink !== null) {
      freshRoom.p2_blinked = true;
      freshRoom.p2_blinkTime = p2Blink;
      freshRoom.winner = 'p1';
    }

    freshRoom.status = 'finished';
    await redis.set(`room:${roomId}`, JSON.stringify(freshRoom), { ex: PVP_ROOM_TTL });

    return NextResponse.json({ room: freshRoom });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
