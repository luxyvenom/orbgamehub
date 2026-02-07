'use client';

import { CameraView } from '@/components/EyeFighter/CameraView';
import { CountdownOverlay } from '@/components/EyeFighter/CountdownOverlay';
import { OpponentView } from '@/components/EyeFighter/OpponentView';
import { ReadyOverlay } from '@/components/EyeFighter/ReadyOverlay';
import { VsBar } from '@/components/EyeFighter/VsBar';
import { useEyeDetection } from '@/hooks/useEyeDetection';
import { usePvpRoom } from '@/hooks/usePvpRoom';
import {
  GRACE_PERIOD,
  PVP_COUNTDOWN_SECONDS,
  PVP_MAX_DURATION,
  PVP_WIN_AMOUNT,
} from '@/lib/constants';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type LocalPhase = 'waiting' | 'ready' | 'countdown' | 'playing' | 'result';

export default function PvpGamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const forceRole = searchParams.get('role') || undefined;
  const isDemo = searchParams.get('demo') === 'true';
  const demoId = searchParams.get('demoId') || undefined;

  const { room, myRole, error: roomError, loading, markReady, reportBlink, disconnect } = usePvpRoom(roomId, forceRole, isDemo, demoId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [localPhase, setLocalPhase] = useState<LocalPhase>('waiting');
  const [countdown, setCountdown] = useState(PVP_COUNTDOWN_SECONDS);
  const [gameTime, setGameTime] = useState(0);
  const [inGracePeriod, setInGracePeriod] = useState(false);
  const [txState, setTxState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [readySent, setReadySent] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const gameTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const localPhaseRef = useRef(localPhase);
  localPhaseRef.current = localPhase;
  const inGracePeriodRef = useRef(inGracePeriod);
  inGracePeriodRef.current = inGracePeriod;
  const blinkReportedRef = useRef(false);

  // Sync server status → local phase
  useEffect(() => {
    if (!room) return;

    switch (room.status) {
      case 'waiting':
        setLocalPhase('waiting');
        break;
      case 'ready_check':
        setLocalPhase('ready');
        break;
      case 'countdown': {
        if (localPhaseRef.current !== 'countdown' && localPhaseRef.current !== 'playing') {
          // Always show countdown from full duration (avoids server/client clock skew)
          setLocalPhase('countdown');
          setCountdown(PVP_COUNTDOWN_SECONDS);
        }
        break;
      }
      case 'playing':
        if (localPhaseRef.current !== 'playing') {
          setLocalPhase('playing');
          setInGracePeriod(true);
          blinkReportedRef.current = false;
          setTimeout(() => setInGracePeriod(false), GRACE_PERIOD * 1000);
        }
        break;
      case 'finished':
        setLocalPhase('result');
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        break;
    }
  }, [room]);

  // Handle blink detection
  const handleBlinkDetected = useCallback(() => {
    if (localPhaseRef.current !== 'playing') return;
    if (inGracePeriodRef.current) return;
    if (blinkReportedRef.current) return;
    blinkReportedRef.current = true;
    reportBlink();
  }, [reportBlink]);

  const { isReady, isBlinking, faceDetected, ear, error: eyeError, resetBlinks } = useEyeDetection(
    videoRef,
    canvasRef,
    localPhase === 'ready' || localPhase === 'countdown' || localPhase === 'playing',
    handleBlinkDetected
  );

  // Auto-send ready when face detected
  useEffect(() => {
    if (localPhase !== 'ready' || !isReady || !faceDetected || readySent) return;
    const t = setTimeout(() => {
      setReadySent(true);
      resetBlinks();
      markReady();
    }, 500);
    return () => clearTimeout(t);
  }, [localPhase, isReady, faceDetected, readySent, markReady, resetBlinks]);

  // Countdown timer (client-side)
  useEffect(() => {
    if (localPhase !== 'countdown') return;
    if (countdown <= 0) {
      setLocalPhase('playing');
      setInGracePeriod(true);
      blinkReportedRef.current = false;
      setTimeout(() => setInGracePeriod(false), GRACE_PERIOD * 1000);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [localPhase, countdown]);

  // Game timer
  useEffect(() => {
    if (localPhase !== 'playing') return;

    gameTimerRef.current = setInterval(() => {
      setGameTime((t) => t + 0.1);
    }, 100);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [localPhase]);

  // Claim winnings via smart contract
  const handleClaim = useCallback(async () => {
    setTxState('pending');
    try {
      // Build URL params for auth
      const claimParams = new URLSearchParams();
      if (forceRole) claimParams.set('role', forceRole);
      if (isDemo) claimParams.set('demo', 'true');
      if (demoId) claimParams.set('demoId', demoId);
      const qs = claimParams.toString() ? `?${claimParams.toString()}` : '';

      // Get claim signature from server
      const res = await fetch(`/api/pvp/claim-winnings${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTxState('failed');
        setTimeout(() => setTxState(undefined), 3000);
        return;
      }

      // Demo mode: simulate success
      if (data.demo) {
        setTxState('success');
        return;
      }

      // Call smart contract via MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: data.contractAddress as `0x${string}`,
            abi: [
              {
                inputs: [
                  { name: 'roomId', type: 'string' },
                  { name: 'amount', type: 'uint256' },
                  { name: 'signature', type: 'bytes' },
                ],
                name: 'claimWinnings',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
              },
            ],
            functionName: 'claimWinnings',
            args: [roomId, data.amount, data.signature],
          },
        ],
      });

      if (finalPayload.status === 'success') {
        setTxState('success');
      } else {
        setTxState('failed');
        setTimeout(() => setTxState(undefined), 3000);
      }
    } catch {
      setTxState('failed');
      setTimeout(() => setTxState(undefined), 3000);
    }
  }, [roomId, forceRole, isDemo, demoId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId).catch(() => {});
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Determine result
  const isWinner = room?.winner === myRole;
  const isDraw = room?.winner === 'draw';
  const isLoser = room?.winner && room.winner !== 'draw' && room.winner !== myRole;

  const opponentName = myRole === 'p1'
    ? (room?.p2_username || 'Waiting...')
    : (room?.p1_username || 'Player 1');

  const opponentReady = myRole === 'p1' ? (room?.p2_ready ?? false) : (room?.p1_ready ?? false);
  const opponentBlinked = myRole === 'p1' ? (room?.p2_blinked ?? false) : (room?.p1_blinked ?? false);

  const showCamera = localPhase === 'ready' || localPhase === 'countdown' || localPhase === 'playing';

  const rootStyle: React.CSSProperties = {
    width: '393px', height: '852px', margin: '0 auto', display: 'flex', flexDirection: 'column',
    background: '#0f0e17', color: '#ffffff', overflow: 'hidden', position: 'relative',
    fontFamily: "'Space Grotesk', sans-serif",
  };

  if (loading) {
    return (
      <div style={{ ...rootStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ height: '70px', flexShrink: 0, position: 'absolute', top: 0, left: 0, right: 0 }} />
        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(124,58,237,0.25)', marginBottom: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'rgba(255,255,255,0.9)', animation: 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite' }}>hourglass_top</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading room...</p>
      </div>
    );
  }

  if (roomError && !room) {
    return (
      <div style={{ ...rootStyle, alignItems: 'center', justifyContent: 'center', padding: '24px', paddingTop: '70px', gap: '16px' }}>
        <div style={{ fontSize: '36px' }}>❌</div>
        <p style={{ color: '#f87171', textAlign: 'center' }}>{roomError}</p>
        <Button onClick={() => router.push('/play/eye-fighter')} size="lg" variant="tertiary" className="w-full">
          Back
        </Button>
      </div>
    );
  }

  /* ─── WAITING PHASE ─── */
  if (localPhase === 'waiting') {
    return (
      <div style={rootStyle}>
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundSize: '24px 24px',
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          }}
        />

        {/* Top safe zone */}
        <div style={{ height: '70px', flexShrink: 0 }} />

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: '32px' }}>
          {/* Icon */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(124,58,237,0.25)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.9)', animation: 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite' }}>hourglass_top</span>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.3)', opacity: 0.5, transform: 'scale(1.25)', pointerEvents: 'none' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.2, margin: 0 }}>
                Waiting for<br />Opponent
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 400, lineHeight: 1.6, maxWidth: '260px', margin: '8px auto 0' }}>
                Share the access key below to synchronize your connection.
              </p>
            </div>
          </div>

          {/* Code Card */}
          <div style={{ width: '100%', position: 'relative' }}>
            {/* Glow behind */}
            <div style={{ position: 'absolute', inset: '-4px', background: 'linear-gradient(to right, rgba(124,58,237,0.2), rgba(168,85,247,0.2))', borderRadius: '16px', filter: 'blur(16px)', opacity: 0.75, pointerEvents: 'none' }} />
            <div
              style={{
                position: 'relative', width: '100%', borderRadius: '12px',
                background: '#151520', border: '1px solid #2a2a35',
                overflow: 'hidden', boxShadow: '0 25px 50px rgba(88,28,135,0.1)',
              }}
            >
              {/* Grid inside card */}
              <div
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  backgroundSize: '24px 24px',
                  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 10, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Access Key</span>
                  <div style={{ fontWeight: 700, fontSize: '30px', letterSpacing: '0.2em', color: '#ffffff', fontFamily: 'monospace', textShadow: '0 0 4px rgba(168,85,247,0.6), 0 0 12px rgba(139,92,246,0.4)' }}>
                    {roomId}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  style={{
                    flexShrink: 0, width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    {copyFeedback ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
              {/* Bottom line accent */}
              <div style={{ height: '2px', width: '100%', background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.5), transparent)', opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 32px', flexShrink: 0 }}>
          <button
            onClick={() => { disconnect(); router.push('/play/eye-fighter'); }}
            style={{
              width: '100%', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#ffffff', fontWeight: 500, fontSize: '15px', cursor: 'pointer',
              backdropFilter: 'blur(8px)', transition: 'background 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>close</span>
            Cancel Matchmaking
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  /* ─── GAME PHASES (ready/countdown/playing/result) ─── */
  return (
    <div style={rootStyle}>
      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0 }} />

      {/* Camera views (ready/countdown/playing) */}
      {showCamera && (
        <div className="flex flex-col flex-1 min-h-0">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isBlinking={isBlinking}
            ear={ear}
            label="YOU"
            showEarBar={localPhase === 'playing'}
          />
          <VsBar gameTime={gameTime} isPlaying={localPhase === 'playing'} inGracePeriod={inGracePeriod} />
          <OpponentView
            type="pvp"
            opponentName={opponentName}
            opponentReady={opponentReady}
            opponentBlinked={opponentBlinked}
          />
        </div>
      )}

      {localPhase === 'countdown' && <CountdownOverlay countdown={countdown} />}
      {localPhase === 'ready' && <ReadyOverlay isReady={isReady} faceDetected={faceDetected} />}

      {eyeError && (
        <div className="absolute top-0 left-0 right-0 bg-red-900/80 text-red-200 text-xs text-center py-2 px-4 z-20">
          {eyeError}
        </div>
      )}

      {/* Result */}
      {localPhase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <div className="text-6xl mb-2">
            {isWinner ? '🏆' : isDraw ? '🤝' : '😵'}
          </div>
          <h2 className="text-2xl font-bold">
            {isWinner ? 'YOU WIN!' : isDraw ? 'DRAW!' : 'YOU LOST!'}
          </h2>
          <p className="text-gray-400 text-center">
            {isWinner
              ? `Opponent blinked! You win ${PVP_WIN_AMOUNT} WLD`
              : isDraw
              ? `Both held for ${PVP_MAX_DURATION}s. Bets returned.`
              : isLoser
              ? 'You blinked first. Better luck next time!'
              : 'Game ended.'}
          </p>

          {isWinner && (
            <LiveFeedback
              label={{ failed: 'Claim failed', pending: 'Claiming...', success: 'Claimed!' }}
              state={txState}
              className="w-full"
            >
              <Button onClick={handleClaim} size="lg" variant="primary" className="w-full">
                Claim {PVP_WIN_AMOUNT} WLD
              </Button>
            </LiveFeedback>
          )}

          <Button
            onClick={() => router.push('/play/eye-fighter/pvp?action=create')}
            size="lg" variant="tertiary" className="w-full"
          >
            Play Again
          </Button>
          <Button
            onClick={() => router.push('/play/eye-fighter')}
            size="lg" variant="tertiary" className="w-full"
          >
            Back to Mode Select
          </Button>
        </div>
      )}
    </div>
  );
}
