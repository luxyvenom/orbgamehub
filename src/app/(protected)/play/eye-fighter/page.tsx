'use client';

import { useEyeDetection } from '@/hooks/useEyeDetection';
import {
  AI_BLINK_RANGE,
  COUNTDOWN_SECONDS,
  GAME_MAX_DURATION,
  GAME_WALLET,
  VERIFY_ACTION,
} from '@/lib/constants';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, Tokens, tokenToDecimals, VerificationLevel } from '@worldcoin/minikit-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type GamePhase = 'verify' | 'bet' | 'ready' | 'countdown' | 'playing' | 'result';
type GameResult = 'win' | 'lose' | 'draw' | null;

export default function EyeFighterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const betFromQuery = parseFloat(searchParams.get('bet') ?? '0');

  const videoRef = useRef<HTMLVideoElement>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval>>(null);

  const [phase, setPhase] = useState<GamePhase>(betFromQuery > 0 ? 'ready' : 'verify');
  const [betAmount, setBetAmount] = useState(betFromQuery || 0.1);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [gameTime, setGameTime] = useState(0);
  const [result, setResult] = useState<GameResult>(null);
  const [aiEyeOpen, setAiEyeOpen] = useState(true);
  const [, setVerified] = useState(false);
  const [verifyState, setVerifyState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [payState, setPayState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [txState, setTxState] = useState<'pending' | 'success' | 'failed' | undefined>();

  const gameActiveRef = useRef(false);
  const resultSetRef = useRef(false);

  const { isReady, isBlinking, faceDetected, ear, resetBlinks } = useEyeDetection(
    videoRef,
    phase === 'countdown' || phase === 'playing' || phase === 'ready'
  );

  // --- VERIFY ---
  const handleVerify = useCallback(async () => {
    setVerifyState('pending');
    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: VERIFY_ACTION,
        verification_level: VerificationLevel.Orb,
      });

      const res = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({ payload: finalPayload, action: VERIFY_ACTION }),
      });
      const data = await res.json();

      if (data.verifyRes.success) {
        setVerified(true);
        setVerifyState('success');
        setPhase('bet');
      } else {
        setVerifyState('failed');
        setTimeout(() => setVerifyState(undefined), 2000);
      }
    } catch {
      setVerifyState('failed');
      setTimeout(() => setVerifyState(undefined), 2000);
    }
  }, []);

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
            token_amount: tokenToDecimals(betAmount, Tokens.WLD).toString(),
          },
        ],
        description: `Eye Fighter Bet: ${betAmount} WLD`,
      });

      if (finalPayload.status === 'success') {
        // Verify payment server-side
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
  }, [betAmount]);

  // --- COUNTDOWN ---
  const startCountdown = useCallback(() => {
    resetBlinks();
    resultSetRef.current = false;
    setResult(null);
    setAiEyeOpen(true);
    setCountdown(COUNTDOWN_SECONDS);
    setGameTime(0);
    setPhase('countdown');
  }, [resetBlinks]);

  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown <= 0) {
      setPhase('playing');
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // --- GAME PLAYING ---
  useEffect(() => {
    if (phase !== 'playing') return;

    gameActiveRef.current = true;
    resultSetRef.current = false;

    // AI blink timer
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

    // Game clock
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

  // Detect player blink during game
  useEffect(() => {
    if (phase !== 'playing') return;
    if (isBlinking && !resultSetRef.current && gameActiveRef.current) {
      resultSetRef.current = true;
      gameActiveRef.current = false;
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      setResult('lose');
      setPhase('result');
    }
  }, [isBlinking, phase]);

  // --- SEND NOTIFICATION ---
  const sendResultNotification = useCallback(
    async (gameResult: GameResult) => {
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            result: gameResult,
            betAmount,
            gameTime: gameTime.toFixed(1),
          }),
        });
      } catch {
        // notification is best-effort
      }
    },
    [betAmount, gameTime]
  );

  // Send notification on result
  useEffect(() => {
    if (phase === 'result' && result) {
      sendResultNotification(result);
    }
  }, [phase, result, sendResultNotification]);

  // --- CLAIM WINNINGS (Transaction) ---
  const handleClaim = useCallback(async () => {
    setTxState('pending');
    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: '0xF0882554ee924278806d708396F1a7975b732522',
            abi: [
              {
                inputs: [],
                name: 'mintToken',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
              },
            ],
            functionName: 'mintToken',
            args: [],
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
  }, []);

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full w-full bg-black text-white">
      {/* Camera (hidden during verify/bet, visible during game) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full aspect-[4/3] object-cover rounded-2xl ${
          phase === 'verify' || phase === 'bet' ? 'hidden' : ''
        }`}
        style={{ transform: 'scaleX(-1)' }}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        {/* PHASE: VERIFY */}
        {phase === 'verify' && (
          <>
            <div className="text-6xl mb-4">👁</div>
            <h1 className="text-2xl font-bold text-center">Eye Fighter</h1>
            <p className="text-gray-400 text-center text-sm">
              Stare down the AI. Blink and you lose.
              <br />
              World ID required for fair play.
            </p>
            <LiveFeedback
              label={{ failed: 'Verification failed', pending: 'Verifying...', success: 'Verified!' }}
              state={verifyState}
              className="w-full"
            >
              <Button onClick={handleVerify} size="lg" variant="primary" className="w-full">
                Verify with World ID
              </Button>
            </LiveFeedback>
            <Button
              onClick={() => {
                setVerified(true);
                setPhase('bet');
              }}
              size="lg"
              variant="tertiary"
              className="w-full opacity-50"
            >
              Skip (Demo Mode)
            </Button>
          </>
        )}

        {/* PHASE: BET */}
        {phase === 'bet' && (
          <>
            <h2 className="text-xl font-bold">Place Your Bet</h2>
            <div className="flex gap-3 w-full">
              {[0.1, 0.5, 1.0].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                    betAmount === amt
                      ? 'bg-white text-black scale-105'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {amt} WLD
                </button>
              ))}
            </div>
            <LiveFeedback
              label={{ failed: 'Payment failed', pending: 'Processing...', success: 'Paid!' }}
              state={payState}
              className="w-full"
            >
              <Button onClick={handlePay} size="lg" variant="primary" className="w-full">
                Bet {betAmount} WLD
              </Button>
            </LiveFeedback>
            <Button
              onClick={() => setPhase('ready')}
              size="lg"
              variant="tertiary"
              className="w-full opacity-50"
            >
              Skip Payment (Demo)
            </Button>
          </>
        )}

        {/* PHASE: READY */}
        {phase === 'ready' && (
          <>
            <div className="text-4xl mb-2">
              {isReady && faceDetected ? '✅' : isReady ? '👀' : '⏳'}
            </div>
            <h2 className="text-xl font-bold">
              {!isReady
                ? 'Loading camera...'
                : !faceDetected
                ? 'Position your face'
                : 'Ready!'}
            </h2>
            <p className="text-gray-400 text-sm text-center">
              {!isReady
                ? 'Initializing eye detection...'
                : !faceDetected
                ? 'Look at the camera so we can detect your eyes'
                : `Bet: ${betAmount} WLD — Don't blink!`}
            </p>
            {isReady && faceDetected && (
              <Button onClick={startCountdown} size="lg" variant="primary" className="w-full">
                Start Game
              </Button>
            )}
          </>
        )}

        {/* PHASE: COUNTDOWN */}
        {phase === 'countdown' && (
          <div className="text-8xl font-black animate-pulse">{countdown}</div>
        )}

        {/* PHASE: PLAYING */}
        {phase === 'playing' && (
          <>
            {/* AI Eye */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div
                  className={`text-6xl transition-all duration-200 ${
                    aiEyeOpen ? 'scale-100' : 'scale-y-0'
                  }`}
                >
                  👁
                </div>
                <p className="text-xs text-gray-400 mt-1">AI</p>
              </div>
              <div className="text-2xl font-bold text-yellow-400">VS</div>
              <div className="text-center">
                <div
                  className={`text-6xl transition-all duration-200 ${
                    isBlinking ? 'scale-y-0' : 'scale-100'
                  }`}
                >
                  👁
                </div>
                <p className="text-xs text-gray-400 mt-1">YOU</p>
              </div>
            </div>

            <div className="text-3xl font-mono font-bold tabular-nums">
              {gameTime.toFixed(1)}s
            </div>
            <p className="text-yellow-400 text-sm font-medium animate-pulse">
              DON&apos;T BLINK!
            </p>

            {/* EAR debug (small) */}
            <div className="text-xs text-gray-600">
              EAR: {ear.toFixed(3)} | Face: {faceDetected ? 'Yes' : 'No'}
            </div>
          </>
        )}

        {/* PHASE: RESULT */}
        {phase === 'result' && (
          <>
            <div className="text-6xl mb-2">
              {result === 'win' ? '🏆' : result === 'lose' ? '😵' : '🤝'}
            </div>
            <h2 className="text-2xl font-bold">
              {result === 'win'
                ? 'YOU WIN!'
                : result === 'lose'
                ? 'YOU BLINKED!'
                : 'DRAW!'}
            </h2>
            <p className="text-gray-400">
              {result === 'win'
                ? `AI blinked at ${gameTime.toFixed(1)}s! You win ${(betAmount * 2).toFixed(1)} WLD`
                : result === 'lose'
                ? `You blinked at ${gameTime.toFixed(1)}s. Better luck next time!`
                : `Both held for ${GAME_MAX_DURATION}s. Bet returned.`}
            </p>

            {result === 'win' && (
              <LiveFeedback
                label={{
                  failed: 'Claim failed',
                  pending: 'Claiming...',
                  success: 'Claimed!',
                }}
                state={txState}
                className="w-full"
              >
                <Button onClick={handleClaim} size="lg" variant="primary" className="w-full">
                  Claim {(betAmount * 2).toFixed(1)} WLD
                </Button>
              </LiveFeedback>
            )}

            <Button
              onClick={() => {
                setPhase('ready');
                setResult(null);
                setGameTime(0);
                setAiEyeOpen(true);
                resetBlinks();
              }}
              size="lg"
              variant="tertiary"
              className="w-full"
            >
              Play Again
            </Button>

            <Button
              onClick={() => router.push('/home')}
              size="lg"
              variant="tertiary"
              className="w-full"
            >
              Back to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
