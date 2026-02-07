'use client';

import { PVP_POLL_INTERVAL } from '@/lib/constants';
import { PlayerRole, PvpRoom } from '@/lib/pvp-types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePvpRoomReturn {
  room: PvpRoom | null;
  myRole: PlayerRole | null;
  error: string | null;
  loading: boolean;
  markReady: () => Promise<void>;
  reportBlink: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function usePvpRoom(
  roomId: string | null,
): UsePvpRoomReturn {
  const [room, setRoom] = useState<PvpRoom | null>(null);
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;
  const blinkReportedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!roomIdRef.current) return;
    try {
      const res = await fetch(`/api/pvp/room-status?roomId=${roomIdRef.current}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch room');
        return;
      }
      const data = await res.json();
      setRoom(data.room);
      setMyRole(data.myRole);
      setLoading(false);
      setError(null);

      if (data.room.status === 'countdown' && data.room.gameStartTime) {
        const now = Date.now();
        if (now >= data.room.gameStartTime) {
          setRoom((prev) => prev ? { ...prev, status: 'playing' } : prev);
        }
      }
    } catch {
      setError('Network error');
    }
  }, []);

  // Start polling
  useEffect(() => {
    if (!roomId) return;
    blinkReportedRef.current = false;
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, PVP_POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomId, fetchStatus]);

  // Stop polling when game is finished
  useEffect(() => {
    if (room?.status === 'finished' && pollRef.current) {
      clearInterval(pollRef.current);
    }
  }, [room?.status]);

  const markReady = useCallback(async () => {
    if (!roomIdRef.current) return;
    try {
      await fetch('/api/pvp/player-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomIdRef.current }),
      });
    } catch { /* best effort */ }
  }, []);

  const reportBlink = useCallback(async () => {
    if (!roomIdRef.current || blinkReportedRef.current) return;
    blinkReportedRef.current = true;
    try {
      await fetch('/api/pvp/report-blink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomIdRef.current }),
      });
    } catch { /* best effort */ }
  }, []);

  const disconnect = useCallback(async () => {
    if (!roomIdRef.current) return;
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      await fetch('/api/pvp/report-disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomIdRef.current }),
      });
    } catch { /* best effort */ }
  }, []);

  // beforeunload → disconnect via sendBeacon
  useEffect(() => {
    if (!roomId) return;
    const handleUnload = () => {
      if (roomIdRef.current) {
        navigator.sendBeacon(
          '/api/pvp/report-disconnect',
          JSON.stringify({ roomId: roomIdRef.current })
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [roomId]);

  return { room, myRole, error, loading, markReady, reportBlink, disconnect };
}
