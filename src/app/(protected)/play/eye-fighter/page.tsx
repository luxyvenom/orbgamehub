'use client';

import { AI_BET_AMOUNT, PVP_BET_AMOUNT } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EyeFighterModePage() {
  const router = useRouter();

  return (
    <div
      style={{
        width: '393px',
        height: '852px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#171121',
        color: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
          pointerEvents: 'none',
        }}
      />

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0 }} />

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 24px',
          paddingBottom: '24px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Eye Fighter
          </h1>
          <p
            style={{
              color: '#9ca3af',
              fontSize: '16px',
              fontWeight: 400,
              marginTop: '8px',
              maxWidth: '260px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Don&apos;t blink. The stakes are high.
          </p>
        </div>

        {/* VS AI Card */}
        <Link
          href="/play/eye-fighter/ai"
          prefetch={true}
          style={{
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            textDecoration: 'none',
            color: '#ffffff',
            marginBottom: '24px',
            display: 'block',
            transition: 'transform 0.15s ease, box-shadow 0.3s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {/* Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '128px',
              height: '128px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              filter: 'blur(32px)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '180px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '48px', marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🤖</span>
                <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>VS AI</h2>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Train your eyes against the machine.</p>
              </div>
              <div
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ffffff' }}>smart_toy</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Low Stakes ({AI_BET_AMOUNT} WLD)
                </span>
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#ffffff' }}>school</span>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Practice</span>
              </div>
            </div>
          </div>
        </Link>

        {/* VS Player Card */}
        <div
          style={{
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #dc2626 0%, #c2410c 100%)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.25)',
            marginBottom: '24px',
          }}
        >
          {/* Glows */}
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'rgba(249,115,22,0.2)',
              filter: 'blur(48px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'rgba(248,113,113,0.2)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
          <div style={{ position: 'relative', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '48px', marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>👀</span>
                <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>VS Player (1v1)</h2>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Real opponents. Real pressure.</p>
              </div>
              <div
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ffffff' }}>visibility</span>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(127,29,29,0.3)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#dc2626' }}>token</span>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626' }}>
                  High Stakes ({PVP_BET_AMOUNT} WLD)
                </span>
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#ffffff' }}>trophy</span>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ranked</span>
              </div>
            </div>

            {/* Create / Join buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link
                href="/play/eye-fighter/pvp?action=create"
                prefetch={true}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '14px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'background 0.15s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                Create
              </Link>
              <Link
                href="/play/eye-fighter/pvp?action=join"
                prefetch={true}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '14px 16px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
                Join
              </Link>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Back to Home */}
        <button
          onClick={() => router.push('/home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#9ca3af',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '9999px',
            fontSize: '15px',
            fontWeight: 500,
            width: '100%',
            transition: 'color 0.2s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Home
        </button>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
