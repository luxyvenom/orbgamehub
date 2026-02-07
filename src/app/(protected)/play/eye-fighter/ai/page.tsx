'use client';

import { CameraView } from '@/components/EyeFighter/CameraView';
import { CountdownOverlay } from '@/components/EyeFighter/CountdownOverlay';
import { OpponentView } from '@/components/EyeFighter/OpponentView';
import { ReadyOverlay } from '@/components/EyeFighter/ReadyOverlay';
import { ResultScreen } from '@/components/EyeFighter/ResultScreen';
import { VsBar } from '@/components/EyeFighter/VsBar';
import { useEyeDetection } from '@/hooks/useEyeDetection';
import {
  AI_BET_AMOUNT,
  AI_BLINK_RANGE,
  COUNTDOWN_SECONDS,
  GAME_CONTRACT,
  GAME_MAX_DURATION,
  GAME_WALLET,
  GRACE_PERIOD,
  WIN_MULTIPLIER,
} from '@/lib/constants';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type GamePhase = 'bet' | 'ready' | 'countdown' | 'playing' | 'result';
type GameResult = 'win' | 'lose' | 'draw' | null;

export default function AiModePage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval>>(null);

  const [phase, setPhase] = useState<GamePhase>('bet');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [gameTime, setGameTime] = useState(0);
  const [result, setResult] = useState<GameResult>(null);
  const [aiEyeOpen, setAiEyeOpen] = useState(true);
  const [payState, setPayState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [txState, setTxState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [refundTxState, setRefundTxState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [inGracePeriod, setInGracePeriod] = useState(false);

  const gameActiveRef = useRef(false);
  const resultSetRef = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const inGracePeriodRef = useRef(inGracePeriod);
  inGracePeriodRef.current = inGracePeriod;

  const handleBlinkDetected = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    if (inGracePeriodRef.current) return;
    if (resultSetRef.current || !gameActiveRef.current) return;
    resultSetRef.current = true;
    gameActiveRef.current = false;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setResult('lose');
    setPhase('result');
  }, []);

  const { isReady, isBlinking, faceDetected, ear, error: eyeError, resetBlinks } = useEyeDetection(
    videoRef,
    canvasRef,
    phase === 'countdown' || phase === 'playing' || phase === 'ready',
    handleBlinkDetected
  );

  // Auto-start: ready → countdown when face detected
  useEffect(() => {
    if (phase !== 'ready' || !isReady || !faceDetected) return;
    const t = setTimeout(() => {
      resetBlinks();
      resultSetRef.current = false;
      setResult(null);
      setAiEyeOpen(true);
      setCountdown(COUNTDOWN_SECONDS);
      setGameTime(0);
      setInGracePeriod(true);
      setPhase('countdown');
    }, 500);
    return () => clearTimeout(t);
  }, [phase, isReady, faceDetected, resetBlinks]);

  // --- PAY ---
  const handlePay = useCallback(async () => {
    setPayState('pending');
    try {
      const initRes = await fetch('/api/initiate-payment', { method: 'POST' });
      const { id } = await initRes.json();
      const { finalPayload } = await MiniKit.commandsAsync.pay({
        reference: id,
        to: GAME_WALLET,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(AI_BET_AMOUNT, Tokens.WLD).toString(),
          },
        ],
        description: `Eye Fighter AI Bet: ${AI_BET_AMOUNT} WLD`,
      });
      if (finalPayload.status === 'success') {
        const confirmRes = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: finalPayload.transaction_id,
            reference: id,
          }),
        });
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          setPayState('success');
          setPhase('ready');
        } else {
          setPayState('failed');
          setTimeout(() => setPayState(undefined), 3000);
        }
      } else {
        setPayState('failed');
        setTimeout(() => setPayState(undefined), 3000);
      }
    } catch {
      setPayState('failed');
      setTimeout(() => setPayState(undefined), 3000);
    }
  }, []);

  // --- COUNTDOWN ---
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      setTimeout(() => {
        setInGracePeriod(false);
        resetBlinks(); // Reset detection after grace period
      }, GRACE_PERIOD * 1000);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, resetBlinks]);

  // --- GAME PLAYING ---
  useEffect(() => {
    if (phase !== 'playing') return;
    gameActiveRef.current = true;
    resultSetRef.current = false;

    const aiDelay =
      (Math.random() * (AI_BLINK_RANGE.max - AI_BLINK_RANGE.min) + AI_BLINK_RANGE.min) * 1000;

    aiTimerRef.current = setTimeout(() => {
      if (!resultSetRef.current && gameActiveRef.current) {
        resultSetRef.current = true;
        gameActiveRef.current = false;
        setAiEyeOpen(false);
        setResult('win');
        setPhase('result');
      }
    }, aiDelay);

    gameTimerRef.current = setInterval(() => {
      setGameTime((t) => {
        const next = t + 0.1;
        if (next >= GAME_MAX_DURATION && !resultSetRef.current) {
          resultSetRef.current = true;
          gameActiveRef.current = false;
          setResult('draw');
          setPhase('result');
        }
        return next;
      });
    }, 100);

    return () => {
      gameActiveRef.current = false;
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [phase]);

  // --- NOTIFICATION ---
  const sendResultNotification = useCallback(
    async (gameResult: GameResult) => {
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: gameResult, betAmount: AI_BET_AMOUNT, gameTime: gameTime.toFixed(1) }),
        });
      } catch { /* best-effort */ }
    },
    [gameTime]
  );

  useEffect(() => {
    if (phase === 'result' && result) sendResultNotification(result);
  }, [phase, result, sendResultNotification]);

  // --- CLAIM / REFUND via smart contract ---
  const handleClaimTx = useCallback(async (
    setStateFn: (s: 'pending' | 'success' | 'failed' | undefined) => void
  ) => {
    if (!GAME_CONTRACT) {
      setStateFn('failed');
      setTimeout(() => setStateFn(undefined), 3000);
      return;
    }
    setStateFn('pending');
    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: GAME_CONTRACT,
            abi: [{ inputs: [], name: 'claimAiWinnings', outputs: [], stateMutability: 'nonpayable', type: 'function' }],
            functionName: 'claimAiWinnings',
            args: [],
          },
        ],
      });
      if (finalPayload.status === 'success') {
        setStateFn('success');
      } else {
        setStateFn('failed');
        setTimeout(() => setStateFn(undefined), 3000);
      }
    } catch {
      setStateFn('failed');
      setTimeout(() => setStateFn(undefined), 3000);
    }
  }, []);

  const handleClaim = useCallback(() => handleClaimTx(setTxState), [handleClaimTx]);
  const handleRefund = useCallback(() => handleClaimTx(setRefundTxState), [handleClaimTx]);

  const winAmount = (AI_BET_AMOUNT * WIN_MULTIPLIER).toFixed(3);
  const showCamera = phase === 'ready' || phase === 'countdown' || phase === 'playing';

  return (
    <div style={{ width: '393px', height: '852px', margin: '0 auto', display: 'flex', flexDirection: 'column', background: '#000000', color: '#ffffff', overflow: 'hidden', position: 'relative' }}>
      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0 }} />
      {showCamera && (
        <div className="flex flex-col flex-1 min-h-0">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isBlinking={isBlinking}
            ear={ear}
            label="YOU"
            showEarBar={phase === 'playing'}
          />
          <VsBar gameTime={gameTime} isPlaying={phase === 'playing'} inGracePeriod={inGracePeriod} />
          <OpponentView type="ai" aiEyeOpen={aiEyeOpen} />
        </div>
      )}

      {phase === 'countdown' && <CountdownOverlay countdown={countdown} />}
      {phase === 'ready' && <ReadyOverlay isReady={isReady} faceDetected={faceDetected} />}

      {eyeError && (
        <div className="absolute top-0 left-0 right-0 bg-red-900/80 text-red-200 text-xs text-center py-2 px-4 z-20">
          {eyeError}
        </div>
      )}

      {!showCamera && (
        <>
          {phase === 'bet' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <div className="text-6xl mb-4">👁 VS 🤖</div>
              <h1 className="text-2xl font-bold text-center">AI Mode</h1>
              <p className="text-gray-400 text-center text-sm">
                Bet {AI_BET_AMOUNT} WLD — Win {winAmount} WLD
              </p>
              <LiveFeedback
                label={{ failed: 'Payment failed', pending: 'Processing...', success: 'Paid!' }}
                state={payState}
                className="w-full"
              >
                <Button onClick={handlePay} size="lg" variant="primary" className="w-full">
                  Bet {AI_BET_AMOUNT} WLD
                </Button>
              </LiveFeedback>
              <Button
                onClick={() => setPhase('ready')}
                size="lg" variant="tertiary" className="w-full"
              >
                Free Play (0 WLD)
              </Button>
              <Button
                onClick={() => router.push('/play/eye-fighter')}
                size="lg" variant="tertiary" className="w-full"
              >
                Back
              </Button>
            </div>
          )}

          {phase === 'result' && (
            <ResultScreen
              result={result}
              gameTime={gameTime}
              winAmount={winAmount}
              betAmount={AI_BET_AMOUNT}
              maxDuration={GAME_MAX_DURATION}
              txState={txState}
              refundTxState={refundTxState}
              onClaim={handleClaim}
              onRefund={handleRefund}
              onPlayAgain={() => {
                setPhase('ready');
                setResult(null);
                setGameTime(0);
                setAiEyeOpen(true);
                setInGracePeriod(false);
                resetBlinks();
              }}
              onGoHome={() => router.push('/home')}
            />
          )}
        </>
      )}
    </div>
  );
}
