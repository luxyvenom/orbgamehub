'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { key: 'home', icon: 'home', label: 'HOME', path: '/home' },
  { key: 'game', icon: 'sports_esports', label: 'GAME', path: '/games' },
  { key: 'wallet', icon: 'account_balance_wallet', label: 'WALLET', path: '/wallet' },
  { key: 'profile', icon: 'person', label: 'PROFILE', path: '/profile' },
];

export const Navigation = () => {
  const pathname = usePathname();

  // Hide nav on game play pages
  if (pathname.includes('/play/')) return null;

  const activeTab = pathname.includes('/games') || pathname.includes('/play') ? 'game' : pathname.includes('/wallet') ? 'wallet' : pathname.includes('/profile') ? 'profile' : 'home';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '393px',
        zIndex: 40,
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -5px 10px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '64px',
          padding: '0 8px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.path}
              prefetch={true}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                gap: '4px',
                textDecoration: 'none',
                color: isActive ? '#9011d4' : '#9ca3af',
                transition: 'color 0.2s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer */}
      <div style={{ height: '20px', background: '#ffffff' }} />
    </nav>
  );
};
