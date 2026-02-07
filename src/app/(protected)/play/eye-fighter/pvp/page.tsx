'use client';

import { GAME_WALLET, PVP_BET_AMOUNT, PVP_WIN_AMOUNT } from '@/lib/constants';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function PvpLobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'create';
  const { data: session } = useSession();

  const [joinCode, setJoinCode] = useState('');
  const [, setPayState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'paying' | 'creating'>('input');

  const avatarUrl = session?.user?.profilePictureUrl || '';

  const handlePay = async (afterPay: () => Promise<void>) => {
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
            token_amount: tokenToDecimals(PVP_BET_AMOUNT, Tokens.WLD).toString(),
          },
        ],
        description: `Eye Fighter PvP Bet: ${PVP_BET_AMOUNT} WLD`,
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
          await afterPay();
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
  };

  const createRoom = async () => {
    setStep('creating');
    try {
      const res = await fetch('/api/pvp/create-room', { method: 'POST' });
      const data = await res.json();
      if (data.roomId) {
        router.push(`/play/eye-fighter/pvp/${data.roomId}`);
      } else {
        setError(data.error || 'Failed to create room');
        setStep('input');
      }
    } catch {
      setError('Network error');
      setStep('input');
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setStep('creating');
    try {
      const res = await fetch('/api/pvp/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: joinCode.trim() }),
      });
      const data = await res.json();
      if (data.roomId) {
        router.push(`/play/eye-fighter/pvp/${data.roomId}`);
      } else {
        setError(data.error || 'Failed to join room');
        setStep('input');
      }
    } catch {
      setError('Network error');
      setStep('input');
    }
  };

  const handleCreate = () => handlePay(() => createRoom());
  const handleJoin = () => handlePay(() => joinRoom());
  const handleCreateFree = () => createRoom();
  const handleJoinFree = () => joinRoom();

  /* ─── JOIN VIEW ─── */
  if (action === 'join') {
    return <JoinView
      router={router}
      setJoinCode={setJoinCode}
      error={error}
      setError={setError}
      step={step}
      handleJoin={handleJoin}
      handleJoinFree={handleJoinFree}
    />;
  }

  /* ─── CREATE VIEW ─── */
  return (
    <div
      style={{
        width: '393px',
        height: '852px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f0a15',
        color: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Background effects */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,70,239,0.4), rgba(127,13,242,0.1) 60%, transparent 80%)', filter: 'blur(60px)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '256px', height: '256px', borderRadius: '50%', background: 'rgba(127,13,242,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=\")", opacity: 0.2, mixBlendMode: 'overlay', pointerEvents: 'none' }} />

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 16px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <button
          onClick={() => router.push('/play/eye-fighter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          <span>Back</span>
        </button>
        <div style={{ width: '32px' }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '0 24px', gap: '24px' }}>

        {/* Wallet Card */}
        <div
          style={{
            background: 'rgba(127,13,242,0.15)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(168,85,247,0.3)',
            boxShadow: '0 8px 32px rgba(127,13,242,0.25)',
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '66%', height: '100%', background: 'linear-gradient(to left, rgba(255,255,255,0.05), transparent)', transform: 'skewX(12deg)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#4ade80' }}>account_balance_wallet</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>WLD Balance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff', filter: 'drop-shadow(0 0 15px rgba(217,70,239,0.5))' }}>450.00</span>
              <span style={{ fontSize: '20px', color: '#c4b5fd', fontWeight: 500 }}>WLD</span>
            </div>
            <div style={{ marginTop: '20px', width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '16px 16px 0', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Available</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>445.00 WLD</div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Staked</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#d946ef' }}>5.00 WLD</div>
              </div>
            </div>
          </div>
        </div>

        {/* VS Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', width: '100%', justifyContent: 'center' }}>
            {/* You */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #7f0df2, #d946ef)', boxShadow: '0 0 20px rgba(127,13,242,0.5)', position: 'relative' }}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="You" fill style={{ borderRadius: '50%', objectFit: 'cover', background: '#111827' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '28px' }}>person</span>
                  </div>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#1a1425', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', color: '#ffffff', border: '1px solid rgba(127,13,242,0.3)', whiteSpace: 'nowrap', zIndex: 10 }}>YOU</div>
            </div>
            {/* VS */}
            <span style={{ fontSize: '28px', fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to bottom, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>VS</span>
            {/* Unknown */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                <span className="material-symbols-outlined" style={{ color: '#6b7280', fontSize: '24px' }}>question_mark</span>
              </div>
              <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#1a1425', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', color: '#6b7280', border: '1px solid #374151', whiteSpace: 'nowrap', zIndex: 10 }}>PLAYER</div>
            </div>
          </div>
          {/* Win badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(to right, rgba(245,158,11,0.1), rgba(234,88,12,0.1))', border: '1px solid rgba(245,158,11,0.3)', padding: '8px 24px', borderRadius: '9999px', boxShadow: '0 0 15px rgba(245,158,11,0.1)', backdropFilter: 'blur(12px)', marginTop: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fbbf24' }}>trophy</span>
            <span style={{ color: '#fcd34d', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Win {PVP_WIN_AMOUNT} WLD</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Setup Progress</h3>
            <span style={{ background: 'rgba(127,13,242,0.2)', color: '#7f0df2', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(127,13,242,0.2)' }}>Step 1 of 3</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 16px' }}>
            {/* Track bg */}
            <div style={{ position: 'absolute', top: '14px', left: '16%', right: '16%', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '14px', left: '16%', width: '15%', height: '2px', background: 'linear-gradient(to right, #7f0df2, #d946ef)', borderRadius: '9999px', zIndex: 0, boxShadow: '0 0 8px #d946ef' }} />
            {/* Step 1 - Active */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%', position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7f0df2, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(127,13,242,0.6)', outline: '4px solid #0f0a15', zIndex: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff' }}>lock</span>
              </div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', marginTop: '8px' }}>Stake</p>
            </div>
            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%', opacity: 0.4 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1425', border: '1px solid #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '4px solid #0f0a15', zIndex: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#9ca3af' }}>ios_share</span>
              </div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginTop: '8px' }}>Share</p>
            </div>
            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%', opacity: 0.4 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1425', border: '1px solid #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '4px solid #0f0a15', zIndex: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#9ca3af' }}>emoji_events</span>
              </div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginTop: '8px' }}>Win</p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ width: '100%', background: 'rgba(127,29,29,0.5)', color: '#fca5a5', fontSize: '14px', textAlign: 'center', padding: '8px 16px', borderRadius: '12px' }}>
            {error}
          </div>
        )}

        {step === 'creating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
            <div style={{ fontSize: '36px' }}>⏳</div>
            <p style={{ color: '#9ca3af', margin: 0 }}>Creating room...</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step === 'input' && (
        <div style={{ padding: '8px 24px 32px', position: 'relative', zIndex: 10, background: 'linear-gradient(to top, #0f0a15, #0f0a15, transparent)', flexShrink: 0 }}>
          <button
            onClick={handleCreate}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #7f0df2, #a855f7, #d946ef)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '18px',
              padding: '20px',
              borderRadius: '16px',
              border: 'none',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(127,13,242,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_balance_wallet</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1, gap: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e9d5ff' }}>Total Cost</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>Pay {PVP_BET_AMOUNT} WLD &amp; Create</span>
            </div>
            <span className="material-symbols-outlined" style={{ marginLeft: 'auto', opacity: 0.7, fontSize: '20px' }}>arrow_forward</span>
          </button>

          <button
            onClick={handleCreateFree}
            style={{ width: '100%', background: 'none', border: 'none', color: '#a78bfa', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '12px', marginTop: '4px' }}
          >
            Free Play (0 WLD)
          </button>

          <p style={{ textAlign: 'center', fontSize: '10px', color: '#6b7280', marginTop: '4px', lineHeight: 1.6 }}>
            {PVP_BET_AMOUNT} WLD will be locked in the smart contract until the match concludes.
          </p>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

/* ─── JOIN VIEW COMPONENT ─── */
function JoinView({
  router,
  setJoinCode,
  error,
  setError,
  step,
  handleJoin,
  handleJoinFree,
}: {
  router: ReturnType<typeof useRouter>;
  setJoinCode: (v: string) => void;
  error: string | null;
  setError: (v: string | null) => void;
  step: string;
  handleJoin: () => void;
  handleJoinFree: () => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // Sync digits → joinCode
  useEffect(() => {
    setJoinCode(digits.join(''));
  }, [digits, setJoinCode]);

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Take only last char, numbers only
    const char = value.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;

    setError(null);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-focus next
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits, setError]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
      e.preventDefault();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setError(null);
    // Focus the next empty or last
    const nextEmpty = newDigits.findIndex((d) => d === '');
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  }, [digits, setError]);

  const isComplete = digits.every((d) => d !== '');

  const inputStyle = (idx: number): React.CSSProperties => ({
    width: '48px',
    height: '64px',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: "'Space Grotesk', monospace",
    borderRadius: '12px',
    background: '#1f2937',
    border: `2px solid ${focusedIdx === idx ? '#f97316' : 'transparent'}`,
    color: '#ffffff',
    outline: 'none',
    boxShadow: focusedIdx === idx ? '0 0 0 4px rgba(249,115,22,0.2)' : '0 1px 2px rgba(0,0,0,0.2)',
    transition: 'all 0.15s ease',
    caretColor: '#7c3aed',
  });

  return (
    <div
      style={{
        width: '393px',
        height: '852px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#050505',
        color: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 16px', flexShrink: 0 }}>
        <button
          onClick={() => router.push('/play/eye-fighter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          <span>Back</span>
        </button>
        <div style={{ width: '32px' }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: '32px' }}>
        {/* VS Icons + Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px', animation: 'bounce-slow 3s infinite' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#a855f7' }}>person</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#64748b' }}>VS</span>
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#a855f7' }}>person</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            PvP Mode
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: '#1e293b',
              border: '1px solid #334155',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>Bet {PVP_BET_AMOUNT} WLD</span>
          </div>
        </div>

        {/* Code input section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Enter Room Code
          </p>

          {/* 6 individual inputs: 3 + dash + 3 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onPaste={handlePaste}>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[i]}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={() => setFocusedIdx(i)}
                onBlur={() => setFocusedIdx(null)}
                placeholder="-"
                style={inputStyle(i)}
              />
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '8px', color: '#64748b', fontWeight: 700, fontSize: '20px' }}>-</div>
            {[3, 4, 5].map((i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[i]}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={() => setFocusedIdx(i)}
                onBlur={() => setFocusedIdx(null)}
                placeholder="-"
                style={inputStyle(i)}
              />
            ))}
          </div>

          {error && (
            <div style={{ width: '100%', background: 'rgba(127,29,29,0.5)', color: '#fca5a5', fontSize: '14px', textAlign: 'center', padding: '8px 16px', borderRadius: '12px' }}>
              {error}
            </div>
          )}

          {step === 'creating' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#a855f7', animation: 'pulse 2s infinite' }}>hourglass_top</span>
              </div>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Joining room...</p>
            </div>
          )}

          {/* Don't have a code? */}
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Don&apos;t have a code?</p>
            <button
              onClick={() => { router.replace('/play/eye-fighter/pvp?action=create'); setError(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#7c3aed',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                padding: 0,
              }}
            >
              Create a Room instead
            </button>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '8px 24px 32px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {step === 'input' && (
          <>
            <button
              onClick={handleJoin}
              disabled={!isComplete}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: isComplete
                  ? 'linear-gradient(to right, #7c3aed, #a855f7)'
                  : 'linear-gradient(to right, #4b5563, #6b7280)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '18px',
                padding: '16px 24px',
                borderRadius: '9999px',
                border: 'none',
                cursor: isComplete ? 'pointer' : 'not-allowed',
                boxShadow: isComplete ? '0 8px 24px rgba(124,58,237,0.4)' : 'none',
                transition: 'all 0.2s ease',
                opacity: isComplete ? 1 : 0.6,
              }}
            >
              <span style={{ fontSize: '18px', letterSpacing: '0.02em' }}>Join Room</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
            <button
              onClick={handleJoinFree}
              disabled={!isComplete}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#a78bfa',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isComplete ? 'pointer' : 'not-allowed',
                padding: '8px',
                opacity: isComplete ? 1 : 0.5,
              }}
            >
              Free Play (0 WLD)
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        input::placeholder {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
