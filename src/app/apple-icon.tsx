import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070A13',
          borderRadius: 40,
          border: '3px solid rgba(99, 102, 241, 0.4)',
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="apple-s-bg" cx="50%" cy="20%" r="90%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="apple-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#6366F1" />
              <stop offset="70%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="apple-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            rx="10"
            fill="url(#apple-s-bg)"
            stroke="url(#apple-s-border)"
            strokeWidth="1.2"
          />
          <path
            d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
            stroke="url(#apple-s-grad)"
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
      </div>
    ),
    {
      ...size,
    }
  );
}
