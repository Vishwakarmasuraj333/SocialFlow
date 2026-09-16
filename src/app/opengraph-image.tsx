import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'SocialFlow — Real-Time Multi-Channel Social Media Management';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #070A13 0%, #0D1322 50%, #141B30 100%)',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            width: '700px',
            height: '400px',
            borderRadius: '100%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Logo and Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* Classic S-Network Emblem */}
          <svg
            width="76"
            height="76"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="og-s-bg" cx="50%" cy="20%" r="90%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="60%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <linearGradient id="og-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="35%" stopColor="#6366F1" />
                <stop offset="70%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id="og-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="36" height="36" rx="10" fill="url(#og-s-bg)" stroke="url(#og-s-border)" strokeWidth="1.2"/>
            <path
              d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
              stroke="url(#og-s-grad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="25" cy="11.5" r="2" fill="#38BDF8" />
            <circle cx="25" cy="11.5" r="0.9" fill="#FFFFFF" />
            <circle cx="18" cy="18" r="1.6" fill="#A855F7" />
            <circle cx="11.5" cy="23.5" r="2" fill="#EC4899" />
            <circle cx="11.5" cy="23.5" r="0.9" fill="#FFFFFF" />
          </svg>

          <span
            style={{
              fontSize: '56px',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              color: '#ffffff',
            }}
          >
            Social<span style={{ color: '#818cf8' }}>Flow</span>
          </span>
        </div>

        {/* Tagline */}
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 800,
            textAlign: 'center',
            color: '#f8fafc',
            maxWidth: '960px',
            lineHeight: 1.2,
            margin: '0 0 16px 0',
          }}
        >
          Real-Time Social Media Management Platform
        </h1>

        <p
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 0 36px 0',
          }}
        >
          Plan, schedule, publish, monitor and analyze content across all social networks with unified real-time telemetry.
        </p>

        {/* Pill Badges */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
          }}
        >
          {['Omni-Publishing', 'Unified Inbox', 'Approval Workflows', 'Deep Analytics', 'Automated Sync'].map((item) => (
            <div
              key={item}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: '#c7d2fe',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
