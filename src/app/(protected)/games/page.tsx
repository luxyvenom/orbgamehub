'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const categories = ['All Games', 'Arcade', 'Puzzle', 'Strategy'];

const comingSoon = [
  { name: 'Neon Racer', tag: 'Racing • Lvl 5', img: '/game-neon-racer.jpg' },
  { name: 'Space Miner', tag: 'Arcade • Lvl 8', img: '/game-space-miner.jpg' },
  { name: 'Puzzle Bot', tag: 'Logic • Lvl 10', img: '/game-puzzle-bot.jpg' },
  { name: 'Cyber Chess', tag: 'Strategy • Lvl 12', img: '/game-cyber-chess.jpg' },
];

export default function GamesPage() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState(0);
  const [playHover, setPlayHover] = useState(false);

  return (
    <div
      style={{
        width: '393px',
        height: '852px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#f7f6f8',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        .games-scroll::-webkit-scrollbar { display: none; }
        .games-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0, background: '#f7f6f8' }} />

      {/* Scrollable content */}
      <div
        className="games-scroll"
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '100px' }}
      >
        {/* Header */}
        <div style={{ padding: '8px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', color: '#151118', lineHeight: 1.2, margin: 0 }}>
              Game Hub
            </h1>
            <p style={{ color: '#706189', fontSize: '14px', fontWeight: 500, marginTop: '4px', margin: 0 }}>
              Discover &amp; Play
            </p>
          </div>
          <div
            style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#ffffff',
              border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#7c3bed' }}>notifications</span>
          </div>
        </div>

        {/* Hero Card: Eye Fighter */}
        <div style={{ padding: '16px 24px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/5',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
          >
            {/* Background Image */}
            <img
              src="/home-banner.jpg"
              alt="Eye Fighter"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(19,17,24,0.9) 0%, rgba(19,17,24,0.4) 40%, transparent 100%)',
              }}
            />
            {/* Content */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
              }}
            >
              {/* Featured badge */}
              <div
                style={{
                  marginBottom: 'auto',
                  alignSelf: 'flex-end',
                  padding: '4px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Featured
              </div>

              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '30px',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                Eye Fighter
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <span>Action</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                <span>Cyberpunk</span>
              </div>

              {/* Social proof & Play button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
                {/* Facepile */}
                <div style={{ display: 'flex' }}>
                  {['/avatar1.jpg', '/avatar2.jpg'].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '2px solid #131118',
                        objectFit: 'cover',
                        marginLeft: i > 0 ? '-12px' : 0,
                      }}
                    />
                  ))}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(124,59,237,0.9)',
                      border: '2px solid #131118',
                      marginLeft: '-12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    +1k
                  </div>
                </div>

                {/* Play Now button */}
                <button
                  onMouseEnter={() => setPlayHover(true)}
                  onMouseLeave={() => setPlayHover(false)}
                  onClick={() => router.push('/play/eye-fighter')}
                  style={{
                    flex: 1,
                    maxWidth: '140px',
                    height: '44px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: playHover ? '#f3f4f6' : '#ffffff',
                    color: '#131118',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tags */}
        <div
          className="games-scroll"
          style={{ padding: '0 24px 8px', display: 'flex', gap: '12px', overflowX: 'auto' }}
        >
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCat(i)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: i === activeCat ? 600 : 500,
                border: i === activeCat ? 'none' : '1px solid #f3f4f6',
                background: i === activeCat ? '#7c3bed' : '#ffffff',
                color: i === activeCat ? '#ffffff' : '#706189',
                boxShadow: i === activeCat ? '0 2px 8px rgba(124,59,237,0.2)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Coming Soon Grid */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#131118', margin: 0 }}>Coming Soon</h2>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#7c3bed',
                background: 'rgba(124,59,237,0.1)',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              4 Locked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {comingSoon.map((game) => (
              <div
                key={game.name}
                style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid #f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Image with lock overlay */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                  }}
                >
                  <img
                    src={game.img}
                    alt={game.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.6,
                      filter: 'grayscale(30%)',
                    }}
                  />
                  {/* Lock overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(1px)',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7c3bed' }}>lock</span>
                    </div>
                  </div>
                </div>

                {/* Game info */}
                <div>
                  <h3 style={{ fontWeight: 700, color: '#131118', fontSize: '16px', margin: 0 }}>{game.name}</h3>
                  <p style={{ color: '#706189', fontSize: '12px', marginTop: '4px', margin: 0 }}>{game.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
