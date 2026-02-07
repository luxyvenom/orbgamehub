'use client';

import { getNewNonces } from '@/auth/wallet/server-helpers';
import { MiniKit } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type ButtonState = 'idle' | 'signing' | 'verified';

export default function LandingPage() {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const { isInstalled } = useMiniKit();
  const { status } = useSession();
  const router = useRouter();

  // Already logged in → go to home
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/home');
    }
  }, [status, router]);

  const handleEnter = useCallback(async () => {
    if (!isInstalled || buttonState !== 'idle') return;
    setButtonState('signing');

    try {
      // Step 1: Get nonces
      const { nonce, signedNonce } = await getNewNonces();

      // Step 2: World App wallet auth popup
      const result = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
        statement: `Authenticate (${crypto.randomUUID().replace(/-/g, '')}).`,
      });

      if (!result || result.finalPayload.status !== 'success') {
        console.error('Wallet auth failed');
        setButtonState('idle');
        return;
      }

      // Step 3: Show VERIFIED!
      setButtonState('verified');

      // Step 4: Sign in and redirect after brief delay
      await new Promise((r) => setTimeout(r, 1200));

      await signIn('credentials', {
        redirectTo: '/home',
        nonce,
        signedNonce,
        finalPayloadJson: JSON.stringify(result.finalPayload),
      });
    } catch (error) {
      console.error('Wallet auth error:', error);
      setButtonState('idle');
    }
  }, [isInstalled, buttonState]);

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      width: '320px',
      height: '56px',
      borderRadius: '12px',
      border: 'none',
      cursor: buttonState === 'idle' ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
    };

    if (buttonState === 'signing') {
      return {
        ...base,
        background: 'linear-gradient(90deg, #3b1578 0%, #4c1d95 100%)',
        boxShadow: '0 0 30px rgba(124, 58, 237, 0.3)',
        opacity: 0.9,
      };
    }
    if (buttonState === 'verified') {
      return {
        ...base,
        background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
      };
    }
    return {
      ...base,
      background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)',
      boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
    };
  };

  const getButtonContent = () => {
    if (buttonState === 'signing') {
      return (
        <>
          {/* CSS spinner */}
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2.5px solid rgba(255,255,255,0.3)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span
            style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '3px',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            SIGNING IN...
          </span>
        </>
      );
    }
    if (buttonState === 'verified') {
      return (
        <>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '3px',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            VERIFIED!
          </span>
        </>
      );
    }
    return (
      <span
        style={{
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '4px',
          paddingLeft: '4px',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        ENTER
      </span>
    );
  };

  return (
    <div
      style={{
        width: '393px',
        height: '852px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #0a0015 0%, #2d1068 100%)',
        margin: '0 auto',
        color: '#ffffff',
      }}
    >
      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0 }} />

      {/* Background glow - top left */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(124, 57, 239, 0.1)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Background glow - bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(147, 51, 234, 0.1)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 24px',
          zIndex: 10,
          width: '100%',
        }}
      >
        {/* Logo with glow */}
        <div
          style={{
            position: 'relative',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '16px',
              background: 'rgba(124, 57, 239, 0.5)',
              filter: 'blur(20px)',
              opacity: 0.75,
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '148px',
              height: '148px',
              borderRadius: '16px',
              background: 'rgba(0, 0, 0, 0.4)',
              boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #1a0b2e, #2d1b4e, #0d0615)',
                opacity: 0.9,
              }}
            />
            <img
              src="/logo.png"
              alt="OrbGameHub"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scale(1.5)',
                position: 'relative',
                zIndex: 10,
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
              color: '#ffffff',
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              margin: 0,
            }}
          >
            OrbGameHub
          </h1>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#a78bfa',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: '4px',
              margin: 0,
            }}
          >
            BET TO WIN!
          </h2>
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            marginBottom: '40px',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#9ca3af',
              fontWeight: 400,
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: '280px',
              margin: 0,
            }}
          >
            Stare down AI or challenge friends. Prove you&apos;re human. Play fair. Win WLD.
          </p>
        </div>

        {/* Button */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <button
            onClick={handleEnter}
            disabled={buttonState !== 'idle'}
            style={getButtonStyle()}
          >
            {getButtonContent()}
          </button>
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '384px',
          }}
        >
          {[
            { icon: '🤖', label: 'AI Mode' },
            { icon: '⚔️', label: 'PvP Mode' },
            { icon: '💰', label: 'WLD Bet' },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '6px 16px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: '12px', marginRight: '6px' }}>
                {badge.icon}
              </span>
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          width: '100%',
          paddingBottom: '32px',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: '1px',
            width: '96px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            marginBottom: '16px',
          }}
        />
        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: 500,
            letterSpacing: '0.5px',
            margin: 0,
          }}
        >
          Powered by World App
        </p>
      </div>
    </div>
  );
}
