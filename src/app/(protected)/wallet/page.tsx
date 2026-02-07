'use client';

const transactions = [
  { icon: 'trophy', title: 'Game Win', time: '10:23 AM • Orb Arena', amount: '+0.8 WLD', positive: true, iconColor: '#8c14d2', opacity: 1 },
  { icon: 'casino', title: 'Bet Placed', time: '09:45 AM • Match #8821', amount: '-1.0 WLD', positive: false, iconColor: '#4b5563', opacity: 1 },
  { icon: 'swords', title: 'PvP Reward', time: 'Yesterday • Battle Mode', amount: '+1.8 WLD', positive: true, iconColor: '#8c14d2', opacity: 1 },
  { icon: 'account_balance_wallet', title: 'Deposit', time: 'Yesterday • External', amount: '+50.0 WLD', positive: true, iconColor: '#4b5563', opacity: 0.6 },
];

export default function WalletPage() {
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
        .wallet-scroll::-webkit-scrollbar { display: none; }
        .wallet-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0, background: '#f7f6f8' }} />

      {/* Scrollable content */}
      <div
        className="wallet-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '100px',
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#151118',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            padding: '8px 24px 16px',
            margin: 0,
          }}
        >
          Wallet
        </h1>

        {/* Balance Card */}
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '12px',
              padding: '24px',
              height: '192px',
              background: 'linear-gradient(135deg, #9011d4 0%, #700da6 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: 'absolute',
                right: '-24px',
                top: '-24px',
                width: '128px',
                height: '128px',
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.1,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '-24px',
                bottom: '-24px',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.1,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />

            {/* Balance */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.05em', margin: 0 }}>
                Total Balance
              </p>
              <p style={{ color: '#ffffff', fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '4px', margin: 0 }}>
                1,250 <span style={{ fontSize: '24px', fontWeight: 400, opacity: 0.8 }}>WLD</span>
              </p>
            </div>

            {/* Bottom row */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '9999px',
                  padding: '6px 12px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#86efac', fontWeight: 700 }}>trending_up</span>
                <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500, lineHeight: 1, margin: 0 }}>+120 this week</p>
              </div>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '18px' }}>visibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '0 24px', display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: 'arrow_downward', label: 'Deposit' },
            { icon: 'arrow_upward', label: 'Withdraw' },
          ].map((btn) => (
            <button
              key={btn.label}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#ffffff',
                borderRadius: '12px',
                height: '56px',
                border: '1px solid #f3f4f6',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#8c14d2' }}>{btn.icon}</span>
              <span style={{ color: '#151118', fontWeight: 700, fontSize: '16px' }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Transactions */}
        <div style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#151118', letterSpacing: '-0.02em', margin: 0 }}>
              Recent Transactions
            </h3>
            <button style={{ background: 'none', border: 'none', color: '#8c14d2', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              See All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(243,244,246,1)',
                  opacity: tx.opacity,
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f3f0f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: tx.iconColor,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{tx.icon}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ color: '#151118', fontSize: '16px', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{tx.title}</p>
                  <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 500, marginTop: '4px', margin: 0 }}>{tx.time}</p>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      margin: 0,
                      color: tx.positive ? '#16a34a' : '#151118',
                    }}
                  >
                    {tx.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
