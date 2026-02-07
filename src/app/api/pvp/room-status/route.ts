import { getPvpUser } from '@/lib/pvp-auth';
import { PVP_DISCONNECT_TIMEOUT, PVP_MAX_DURATION, PVP_ROOM_TTL } from '@/lib/constants';
import { PlayerRole, PvpRoom } from '@/lib/pvp-types';
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await getPvpUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = req.nextUrl.searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const raw = await redis.get(`room:${roomId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room: PvpRoom = typeof raw === 'string' ? JSON.parse(raw) : raw as PvpRoom;

    // Merge ready flags from separate keys (set by player-ready to avoid race conditions)
    if (room.status === 'ready_check') {
      const [r1, r2] = await Promise.all([
        redis.get(`room:${roomId}:ready:p1`),
        redis.get(`room:${roomId}:ready:p2`),
      ]);
      if (r1) room.p1_ready = true;
      if (r2) room.p2_ready = true;
    }

    // Determine role by wallet address
    let myRole: PlayerRole;
    if (room.p1_wallet === user.wallet) {
      myRole = 'p1';
    } else if (room.p2_wallet === user.wallet) {
      myRole = 'p2';
    } else {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    // Store ping in a separate key to avoid race conditions.
    // Previously, saving the entire room on every poll would overwrite
    // concurrent changes from join-room, player-ready, etc.
    const now = Date.now();
    const pingKey = `room:${roomId}:ping:${myRole}`;
    await redis.set(pingKey, now, { ex: PVP_ROOM_TTL });

    // Check state transitions — only save room when state actually changes
    let stateChanged = false;

    if (room.status === 'countdown' && room.gameStartTime && now >= room.gameStartTime) {
      room.status = 'playing';
      stateChanged = true;
    }

    if (room.status === 'playing' && !room.winner) {
      // Read opponent ping from separate key
      const opponentPingKey = `room:${roomId}:ping:${myRole === 'p1' ? 'p2' : 'p1'}`;
      const opponentPingRaw = await redis.get(opponentPingKey);
      // Parse ping: Upstash may return string or number
      let opponentPing: number | null = null;
      if (opponentPingRaw !== null && opponentPingRaw !== undefined) {
        opponentPing = typeof opponentPingRaw === 'number'
          ? opponentPingRaw
          : Number(opponentPingRaw);
        if (isNaN(opponentPing)) opponentPing = null;
      }

      // Only check disconnect if we have a valid ping timestamp
      // If no ping key exists yet, opponent just started - don't disconnect them
      if (opponentPing !== null && now - opponentPing > PVP_DISCONNECT_TIMEOUT) {
        room.winner = myRole;
        room.status = 'finished';
        stateChanged = true;
      }

      if (room.gameStartTime && now - room.gameStartTime > PVP_MAX_DURATION * 1000) {
        room.winner = 'draw';
        room.status = 'finished';
        stateChanged = true;
      }
    }

    if (stateChanged) {
      // Re-read fresh room data before saving to avoid overwriting concurrent changes
      const freshRaw = await redis.get(`room:${roomId}`);
      if (freshRaw) {
        const freshRoom: PvpRoom = typeof freshRaw === 'string' ? JSON.parse(freshRaw) : freshRaw as PvpRoom;
        freshRoom.status = room.status;
        if (room.winner) freshRoom.winner = room.winner;
        await redis.set(`room:${roomId}`, JSON.stringify(freshRoom), { ex: PVP_ROOM_TTL });
        return NextResponse.json({ room: freshRoom, myRole });
      }
      await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });
    }

    return NextResponse.json({ room, myRole });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
