'use client';

import { VERIFY_ACTION } from '@/lib/constants';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const GameHub = () => {
  const [verifyState, setVerifyState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [playHover, setPlayHover] = useState(false);

  const onVerify = async () => {
    setVerifyState('pending');
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: VERIFY_ACTION,
        verification_level: VerificationLevel.Orb,
      });
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({ payload: result.finalPayload, action: VERIFY_ACTION }),
      });
      const data = await response.json();
      setVerifyState(data.verifyRes.success ? 'success' : 'failed');
      if (!data.verifyRes.success) setTimeout(() => setVerifyState('idle'), 2000);
    } catch {
      setVerifyState('failed');
      setTimeout(() => setVerifyState('idle'), 2000);
    }
  };

  return (
    <>
      {/* Hover styles */}
      <style>{`
        .quick-card:hover { border-color: rgba(144,17,212,0.5) !important; }
        .quick-card:hover .quick-icon { background: var(--hover-bg) !important; color: #fff !important; }
      `}</style>

      {/* ===== Eye Fighter Game Card ===== */}
      <section style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: '#ffffff',
            width: '100%',
          }}
        >
          {/* Banner image */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111827', overflow: 'hidden' }}>
            <Image
              src="/home-banner.jpg"
              alt="Eye Fighter Banner"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(144,17,212,0.9), transparent)',
                opacity: 0.6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '9999px',
              }}
            >
              Season 3 Live
            </div>
          </div>

          {/* Card body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              background: 'linear-gradient(135deg, #9011d4 0%, #700da6 100%)',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
                  Eye Fighter
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500, margin: '4px 0 0' }}>
                  Battle for supremacy in the arena.
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fde047' }}>star</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>4.9</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {/* Player avatars */}
              <div style={{ display: 'flex', flexShrink: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #9011d4', overflow: 'hidden', background: '#d1d5db', position: 'relative' }}>
                  <Image src="/avatar1.jpg" alt="" fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #9011d4', overflow: 'hidden', background: '#d1d5db', marginLeft: '-8px', position: 'relative' }}>
                  <Image src="/avatar2.jpg" alt="" fill style={{ objectFit: 'cover' }} />
                </div>
                <div
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #9011d4',
                    background: '#ffffff', marginLeft: '-8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#9011d4',
                  }}
                >
                  +12
                </div>
              </div>

              {/* Play Now */}
              <Link
                href="/play/eye-fighter"
                prefetch={true}
                onMouseEnter={() => setPlayHover(true)}
                onMouseLeave={() => setPlayHover(false)}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '12px',
                  border: 'none',
                  background: playHover ? '#f9fafb' : '#ffffff',
                  color: '#9011d4',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transform: playHover ? 'scale(0.95)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                Play Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Grid ===== */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%' }}>
        {[
          { icon: 'trophy', label: 'Rank', value: '#420', change: '5%', iconBg: '#eff6ff', iconColor: '#2563eb', arrow: 'arrow_upward' },
          { icon: 'account_balance_wallet', label: 'ORB', value: '1,250', change: '+120', iconBg: 'rgba(144,17,212,0.1)', iconColor: '#9011d4', arrow: 'add' },
          { icon: 'analytics', label: 'Win Rate', value: '68%', change: '2%', iconBg: '#fff7ed', iconColor: '#ea580c', arrow: 'arrow_upward' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '4px', borderRadius: '12px', padding: '12px', background: '#ffffff',
              border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ padding: '8px', borderRadius: '50%', background: stat.iconBg, color: stat.iconColor, marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', display: 'block' }}>{stat.icon}</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{stat.label}</p>
            <p style={{ color: '#151118', fontSize: '20px', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{stat.value}</p>
            <p style={{ color: '#16a34a', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', margin: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '10px', marginRight: '2px' }}>{stat.arrow}</span>
              {stat.change}
            </p>
          </div>
        ))}
      </section>

      {/* ===== Verify Humanity ===== */}
      <section
        style={{
          borderRadius: '12px', border: '1px solid rgba(144,17,212,0.2)',
          background: 'rgba(144,17,212,0.05)', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          position: 'relative', overflow: 'hidden', width: '100%',
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            position: 'absolute', right: '-16px', bottom: '-16px', fontSize: '128px',
            color: 'rgba(144,17,212,0.05)', pointerEvents: 'none', userSelect: 'none',
          }}
        >
          fingerprint
        </span>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 10 }}>
          <div
            style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#151118' }}>verified_user</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#151118', lineHeight: 1.2, margin: 0 }}>Verify Humanity</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
              Verify with World ID to claim rewards and compete in tournaments.
            </p>
          </div>
        </div>
        <button
          onClick={onVerify}
          disabled={verifyState === 'pending'}
          style={{
            width: '100%', height: '40px', borderRadius: '8px', border: 'none',
            background: verifyState === 'success' ? '#16a34a' : verifyState === 'failed' ? '#dc2626' : '#9011d4',
            color: '#ffffff', fontSize: '14px', fontWeight: 700,
            cursor: verifyState === 'pending' ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10,
            opacity: verifyState === 'pending' ? 0.7 : 1, transition: 'all 0.2s ease',
          }}
        >
          {verifyState === 'pending' ? 'Verifying...' : verifyState === 'success' ? 'Verified!' : verifyState === 'failed' ? 'Failed' : 'Verify Now'}
        </button>
      </section>

      {/* ===== Quick Actions ===== */}
      <section style={{ width: '100%', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#151118', margin: 0 }}>Quick Actions</h3>
          <button style={{ background: 'none', border: 'none', color: '#9011d4', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            View All
          </button>
        </div>
        <div
          className="quick-scroll"
          style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}
        >
          {[
            { icon: 'emoji_events', label: 'Tournaments', sub: '2 Live Now', iconBg: '#f3e8ff', iconColor: '#9011d4', hoverBg: '#9011d4' },
            { icon: 'storefront', label: 'Marketplace', sub: 'New Skins', iconBg: '#fce7f3', iconColor: '#db2777', hoverBg: '#db2777' },
            { icon: 'group_add', label: 'Invite Friends', sub: 'Get +50 ORB', iconBg: '#dcfce7', iconColor: '#16a34a', hoverBg: '#16a34a' },
          ].map((action) => (
            <div
              key={action.label}
              className="quick-card"
              style={{
                // @ts-expect-error CSS custom property
                '--hover-bg': action.hoverBg,
                minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '12px',
                borderRadius: '12px', padding: '16px', background: '#ffffff',
                border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s ease',
              }}
            >
              <div
                className="quick-icon"
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: action.iconBg, color: action.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined">{action.icon}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#151118', fontSize: '14px', margin: 0 }}>{action.label}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{action.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
