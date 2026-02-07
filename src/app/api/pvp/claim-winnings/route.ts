import { auth } from '@/auth';
import { PVP_BET_AMOUNT, PVP_ROOM_TTL, PVP_WIN_AMOUNT } from '@/lib/constants';
import { PvpRoom } from '@/lib/pvp-types';
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { encodePacked, keccak256, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const GAME_CONTRACT = process.env.NEXT_PUBLIC_GAME_CONTRACT;
const GAME_PRIVATE_KEY = process.env.GAME_PRIVATE_KEY as `0x${string}` | undefined;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!GAME_PRIVATE_KEY || !GAME_CONTRACT) {
      return NextResponse.json({ error: 'Contract not configured' }, { status: 500 });
    }

    const callerAddress = session.user.walletAddress as `0x${string}`;
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    // Verify room from Redis
    const raw = await redis.get(`room:${roomId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room: PvpRoom = typeof raw === 'string' ? JSON.parse(raw) : raw as PvpRoom;

    if (room.status !== 'finished' || !room.winner) {
      return NextResponse.json({ error: 'Game not finished' }, { status: 400 });
    }

    let claimAmount: number;

    if (room.winner === 'draw') {
      // Draw: refund the original bet amount
      const callerRole = room.p1_wallet === callerAddress ? 'p1' : room.p2_wallet === callerAddress ? 'p2' : null;
      if (!callerRole) {
        return NextResponse.json({ error: 'Not a player in this room' }, { status: 403 });
      }
      const refundField = callerRole === 'p1' ? 'p1_drawRefunded' : 'p2_drawRefunded';
      if (room[refundField]) {
        return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
      }
      claimAmount = PVP_BET_AMOUNT;

      // Mark as refunded
      room[refundField] = true;
      await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });
    } else {
      // Win: claim the full win amount
      if (room.winnerClaimed) {
        return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
      }
      const winnerWallet = room.winner === 'p1' ? room.p1_wallet : room.p2_wallet;
      if (winnerWallet !== callerAddress) {
        return NextResponse.json({ error: 'Not the winner' }, { status: 403 });
      }
      claimAmount = PVP_WIN_AMOUNT;

      // Mark as claimed
      room.winnerClaimed = true;
      await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: PVP_ROOM_TTL });
    }

    // Generate claim signature
    const amount = parseEther(claimAmount.toString());
    const messageHash = keccak256(
      encodePacked(
        ['string', 'address', 'uint256'],
        [roomId, callerAddress, amount]
      )
    );

    const account = privateKeyToAccount(GAME_PRIVATE_KEY);
    const signature = await account.signMessage({ message: { raw: messageHash } });

    return NextResponse.json({
      success: true,
      signature,
      contractAddress: GAME_CONTRACT,
      amount: amount.toString(),
      callerAddress,
    });
  } catch (error) {
    console.error('[claim-winnings]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
