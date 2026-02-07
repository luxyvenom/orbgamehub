import { auth } from '@/auth';

export default async function ProfilePage() {
  const session = await auth();
  const username = session?.user?.username || 'PlayerOne';
  const walletAddress = session?.user?.walletAddress || '0x1234...5678';
  const avatarUrl = session?.user?.profilePictureUrl || '/profile-avatar.png';

  // Format wallet address for display
  const shortAddress = walletAddress.length > 12
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;

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
      <style>{`
        .profile-main::-webkit-scrollbar { display: none; }
        .profile-main { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top safe zone */}
      <div style={{ height: '70px', flexShrink: 0, background: '#f7f6f8' }} />

      {/* Scrollable content */}
      <div
        className="profile-main"
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
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#151118', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>Profile</h1>
          <button
            style={{
              position: 'relative',
              width: '40px',
              height: '46.4px',
              borderRadius: '50%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '40px', fontVariationSettings: "'wght' 300" }}>
              notifications
            </span>
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '0px',
                height: '10px',
                width: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #f7f6f8',
              }}
            />
          </button>
        </header>

        {/* Profile Card */}
        <section style={{ padding: '8px 16px 0' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '96px',
                background: 'linear-gradient(to bottom, rgba(124,59,237,0.1), transparent)',
              }}
            />

            {/* Avatar */}
            <div style={{ position: 'relative', zIndex: 10, marginBottom: '16px' }}>
              <div
                style={{
                  height: '112px',
                  width: '112px',
                  borderRadius: '50%',
                  padding: '4px',
                  background: 'linear-gradient(to top right, #7c3bed, #d8b4fe)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: '50%',
                    background: '#ffffff',
                    padding: '4px',
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    style={{
                      height: '100%',
                      width: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Name & Address */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{username}</h2>
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>
                {shortAddress}
              </span>
            </div>

            {/* Verified Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(124,59,237,0.1)',
                color: '#7c3bed',
                padding: '4px 12px',
                borderRadius: '9999px',
                marginBottom: '12px',
                marginTop: '8px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Verified Pro
              </span>
            </div>

            {/* Bio */}
            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                textAlign: 'center',
                maxWidth: '200px',
                lineHeight: '1.6',
              }}
            >
              Competitive shooter specialist. Always looking for a squad.
            </p>

            {/* Edit Profile Button */}
            <button
              style={{
                marginTop: '20px',
                width: '100%',
                maxWidth: '200px',
                padding: '10px 0',
                borderRadius: '12px',
                background: '#7c3bed',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(124,59,237,0.2)',
              }}
            >
              Edit Profile
            </button>
          </div>
        </section>

        {/* Stats Card */}
        <section style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Wins */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#3b82f6',
                  marginBottom: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>trophy</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>1,240</span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Wins
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '60px', background: '#f3f4f6' }} />

            {/* Rep */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  color: '#22c55e',
                  marginBottom: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>thumb_up</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>98%</span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Rep
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '60px', background: '#f3f4f6' }} />

            {/* Rank */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  background: '#faf5ff',
                  color: '#7c3bed',
                  marginBottom: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>diamond</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Dia 1</span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Rank
              </span>
            </div>
          </div>
        </section>

        {/* Recent Trophies */}
        <section style={{ padding: '32px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Trophies</h3>
            <button style={{ color: '#7c3bed', fontSize: '14px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              See All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Speedster */}
            <TrophyCard
              icon="speed"
              name="Speedster"
              rarity="Rare"
              borderColor="#60a5fa"
              glowColor="rgba(59,130,246,0.5)"
              bgTint="rgba(96,165,250,0.05)"
              textColor="#3b82f6"
            />
            {/* Collector */}
            <TrophyCard
              icon="inventory_2"
              name="Collector"
              rarity="Epic"
              borderColor="#a855f7"
              glowColor="rgba(124,59,237,0.5)"
              bgTint="rgba(168,85,247,0.05)"
              textColor="#a855f7"
            />
            {/* Champion */}
            <TrophyCard
              icon="military_tech"
              name="Champion"
              rarity="Legendary"
              borderColor="#facc15"
              glowColor="rgba(234,179,8,0.5)"
              bgTint="rgba(250,204,21,0.05)"
              textColor="#eab308"
            />
          </div>
        </section>

        {/* Account Section */}
        <section style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ padding: '0 8px', fontSize: '18px', fontWeight: 700 }}>Account</h3>

          <AccountButton
            icon="person"
            iconBg="#f3f4f6"
            iconColor="#4b5563"
            title="Account Settings"
            subtitle="Privacy, Security, Language"
          />
          <AccountButton
            icon="history"
            iconBg="#f3f4f6"
            iconColor="#4b5563"
            title="Game History"
            subtitle="Past matches and scores"
          />
          <button
            style={{
              width: '100%',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '50%',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <span className="material-symbols-outlined">logout</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: '#ef4444' }}>Log Out</p>
          </button>
        </section>
      </div>
    </div>
  );
}

function TrophyCard({
  icon,
  name,
  rarity,
  borderColor,
  glowColor,
  bgTint,
  textColor,
}: {
  icon: string;
  name: string;
  rarity: string;
  borderColor: string;
  glowColor: string;
  bgTint: string;
  textColor: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          background: '#ffffff',
          borderRadius: '12px',
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 15px -3px ${glowColor}`,
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: bgTint,
            borderRadius: '12px',
          }}
        />
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '36px',
            color: textColor,
            fontVariationSettings: "'FILL' 1",
            position: 'relative',
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, lineHeight: '1.2' }}>{name}</p>
        <p style={{ fontSize: '10px', color: textColor, fontWeight: 500 }}>{rarity}</p>
      </div>
    </div>
  );
}

function AccountButton({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      style={{
        width: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            height: '40px',
            width: '40px',
            borderRadius: '50%',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{title}</p>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>{subtitle}</p>
        </div>
      </div>
      <span className="material-symbols-outlined" style={{ color: '#9ca3af' }}>chevron_right</span>
    </button>
  );
}
