import { auth } from '@/auth';
import { GameHub } from '@/components/GameHub';
import Image from 'next/image';

export default async function Home() {
  const session = await auth();
  const username = session?.user?.username || 'Player';
  const avatarUrl = session?.user?.profilePictureUrl || '';

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
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      }}
    >
      {/* Scrollbar hidden + quick actions horizontal scroll */}
      <style>{`
        .home-main::-webkit-scrollbar { display: none; }
        .home-main { -ms-overflow-style: none; scrollbar-width: none; }
        .quick-scroll::-webkit-scrollbar { display: none; }
        .quick-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0, background: '#f7f6f8' }} />

      {/* Scrollable content */}
      <div
        className="home-main"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '120px',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 24px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #9011d4',
                overflow: 'hidden',
                background: '#e5e7eb',
                flexShrink: 0,
                position: 'relative' as const,
              }}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="avatar" fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#d1d5db' }} />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', lineHeight: 1, marginBottom: '2px' }}>
                Welcome back,
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#151118', lineHeight: 1.2, letterSpacing: '-0.015em' }}>
                {username}
              </span>
            </div>
          </div>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#151118' }}>notifications</span>
          </button>
        </header>

        <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GameHub />
        </div>
      </div>
    </div>
  );
}
