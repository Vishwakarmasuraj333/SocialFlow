const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create official SocialFlow S-Network SVGs
const getIconSvg = (opts = {}) => {
  const {
    size = 512,
    monochrome = false,
    monoColor = '#ffffff',
  } = opts;

  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sf-s-bg" cx="50%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="sf-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="35%" stop-color="#6366F1" />
      <stop offset="70%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
    <linearGradient id="sf-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#F472B6" />
    </linearGradient>
  </defs>

  <rect
    x="0"
    y="0"
    width="36"
    height="36"
    rx="10"
    fill="${monochrome ? monoColor : 'url(#sf-s-bg)'}"
    stroke="${monochrome ? monoColor : 'url(#sf-s-border)'}"
    stroke-width="1.2"
  />

  ${
    monochrome
      ? ''
      : `<path
    d="M1 10C1 5 5 1 10 1H26C31 1 35 5 35 10V13C35 13 20 8 1 13V10Z"
    fill="#FFFFFF"
    fill-opacity="0.15"
  />`
  }

  <path
    d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
    stroke="${monochrome ? '#000000' : 'url(#sf-s-grad)'}"
    stroke-width="3.2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  ${
    monochrome
      ? `<circle cx="25" cy="11.5" r="1.6" fill="#000000" />
  <circle cx="18" cy="18" r="1.4" fill="#000000" />
  <circle cx="11.5" cy="23.5" r="1.6" fill="#000000" />`
      : `<circle cx="25" cy="11.5" r="2" fill="#38BDF8" />
  <circle cx="25" cy="11.5" r="0.9" fill="#FFFFFF" />
  <circle cx="18" cy="18" r="1.6" fill="#A855F7" />
  <circle cx="11.5" cy="23.5" r="2" fill="#EC4899" />
  <circle cx="11.5" cy="23.5" r="0.9" fill="#FFFFFF" />`
  }
</svg>`;
};

// Full Logo SVG
const getFullLogoSvg = (variant = 'dark') => {
  const isLightMode = variant === 'light';
  const textColor = isLightMode ? '#0F172A' : '#FFFFFF';

  return `<svg width="220" height="48" viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sf-s-bg" cx="50%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="sf-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="35%" stop-color="#6366F1" />
      <stop offset="70%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
    <linearGradient id="sf-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#F472B6" />
    </linearGradient>
    <linearGradient id="sf-text-flow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="50%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>

  <g transform="translate(6, 6)">
    <rect x="0" y="0" width="36" height="36" rx="10" fill="url(#sf-s-bg)" stroke="url(#sf-s-border)" stroke-width="1.2"/>
    <path
      d="M1 10C1 5 5 1 10 1H26C31 1 35 5 35 10V13C35 13 20 8 1 13V10Z"
      fill="#FFFFFF"
      fill-opacity="0.15"
    />
    <path
      d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
      stroke="url(#sf-s-grad)"
      stroke-width="3.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="25" cy="11.5" r="2" fill="#38BDF8" />
    <circle cx="25" cy="11.5" r="0.9" fill="#FFFFFF" />
    <circle cx="18" cy="18" r="1.6" fill="#A855F7" />
    <circle cx="11.5" cy="23.5" r="2" fill="#EC4899" />
    <circle cx="11.5" cy="23.5" r="0.9" fill="#FFFFFF" />
  </g>

  <!-- Wordmark -->
  <text x="54" y="32" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="-0.03em" fill="${textColor}">
    Social<tspan fill="url(#sf-text-flow)">Flow</tspan>
  </text>
</svg>`;
};

// OG Image SVG (1200x630)
const getOgImageSvg = () => {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="og-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070A13" />
      <stop offset="50%" stop-color="#0D1322" />
      <stop offset="100%" stop-color="#141B30" />
    </linearGradient>
    <radialGradient id="og-glow-1" cx="30%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#8B5CF6" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#070A13" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="og-glow-2" cx="70%" cy="65%" r="50%">
      <stop offset="0%" stop-color="#EC4899" stop-opacity="0.2" />
      <stop offset="70%" stop-color="#070A13" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="sf-s-bg" cx="50%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="sf-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="35%" stop-color="#6366F1" />
      <stop offset="70%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
    <linearGradient id="sf-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#F472B6" />
    </linearGradient>
    <linearGradient id="sf-text-flow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="50%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#og-bg)" />
  <rect width="1200" height="630" fill="url(#og-glow-1)" />
  <rect width="1200" height="630" fill="url(#og-glow-2)" />

  <!-- Center S-Network Emblem (scale 3.6) -->
  <g transform="translate(535, 95) scale(3.6)">
    <rect x="0" y="0" width="36" height="36" rx="10" fill="url(#sf-s-bg)" stroke="url(#sf-s-border)" stroke-width="1.2"/>
    <path
      d="M1 10C1 5 5 1 10 1H26C31 1 35 5 35 10V13C35 13 20 8 1 13V10Z"
      fill="#FFFFFF"
      fill-opacity="0.15"
    />
    <path
      d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
      stroke="url(#sf-s-grad)"
      stroke-width="3.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="25" cy="11.5" r="2" fill="#38BDF8" />
    <circle cx="25" cy="11.5" r="0.9" fill="#FFFFFF" />
    <circle cx="18" cy="18" r="1.6" fill="#A855F7" />
    <circle cx="11.5" cy="23.5" r="2" fill="#EC4899" />
    <circle cx="11.5" cy="23.5" r="0.9" fill="#FFFFFF" />
  </g>

  <text x="600" y="275" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" letter-spacing="-0.03em">
    <tspan fill="#FFFFFF">Social</tspan><tspan fill="url(#sf-text-flow)">Flow</tspan>
  </text>

  <text x="600" y="340" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#F8FAFC" letter-spacing="-0.02em">
    Real-Time Social Media Management
  </text>

  <text x="600" y="390" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">
    Plan, schedule, publish and analyze your social media content from one powerful platform.
  </text>

  <g transform="translate(600, 460)">
    <rect x="-370" y="0" width="170" height="42" rx="21" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.2" />
    <text x="-285" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#C7D2FE">Omni-Publishing</text>

    <rect x="-180" y="0" width="160" height="42" rx="21" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.2" />
    <text x="-100" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#C7D2FE">Unified Inbox</text>

    <rect x="0" y="0" width="170" height="42" rx="21" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.2" />
    <text x="85" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#C7D2FE">Deep Analytics</text>

    <rect x="190" y="0" width="180" height="42" rx="21" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.2" />
    <text x="280" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#C7D2FE">Real-Time Sync</text>
  </g>
</svg>`;
};

// Apple Icon SVG (180x180)
const getAppleIconSvg = () => {
  return `<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#070A13" />
  <rect x="2" y="2" width="176" height="176" rx="38" stroke="#6366F1" stroke-opacity="0.4" stroke-width="3" />
  <g transform="translate(36, 36) scale(3.0)">
    <radialGradient id="apple-s-bg" cx="50%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="apple-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="35%" stop-color="#6366F1" />
      <stop offset="70%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
    <linearGradient id="apple-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#F472B6" />
    </linearGradient>

    <rect x="0" y="0" width="36" height="36" rx="10" fill="url(#apple-s-bg)" stroke="url(#apple-s-border)" stroke-width="1.2"/>
    <path
      d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
      stroke="url(#apple-s-grad)"
      stroke-width="3.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="25" cy="11.5" r="2" fill="#38BDF8" />
    <circle cx="25" cy="11.5" r="0.9" fill="#FFFFFF" />
    <circle cx="18" cy="18" r="1.6" fill="#A855F7" />
    <circle cx="11.5" cy="23.5" r="2" fill="#EC4899" />
    <circle cx="11.5" cy="23.5" r="0.9" fill="#FFFFFF" />
  </g>
</svg>`;
};

async function generate() {
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');
  const brandDir = path.join(publicDir, 'brand');
  const iconsDir = path.join(publicDir, 'icons');
  const appDir = path.join(rootDir, 'src', 'app');

  if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  // 1. Write vector SVGs
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), getFullLogoSvg('dark'));
  fs.writeFileSync(path.join(publicDir, 'logo-light.svg'), getFullLogoSvg('light'));
  fs.writeFileSync(path.join(publicDir, 'logo-icon.svg'), getIconSvg({ size: 128 }));
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), getIconSvg({ size: 36 }));
  fs.writeFileSync(path.join(appDir, 'icon.svg'), getIconSvg({ size: 36 }));

  fs.writeFileSync(path.join(brandDir, 'socialflow-logo.svg'), getFullLogoSvg('dark'));
  fs.writeFileSync(path.join(brandDir, 'socialflow-logo-light.svg'), getFullLogoSvg('light'));
  fs.writeFileSync(path.join(brandDir, 'socialflow-icon.svg'), getIconSvg({ size: 128 }));

  console.log('✓ Wrote S-Network vector SVGs');

  // 2. Render PNG icons with sharp
  const iconSvgBuffer = Buffer.from(getIconSvg({ size: 512 }));
  await sharp(iconSvgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('✓ Created public/icons/icon-192.png');

  await sharp(iconSvgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('✓ Created public/icons/icon-512.png');

  const appleSvgBuffer = Buffer.from(getAppleIconSvg());
  await sharp(appleSvgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-icon.png'));
  await sharp(appleSvgBuffer).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));
  console.log('✓ Created apple-icon.png (180x180)');

  // 3. Render OpenGraph Image PNG (1200x630)
  const ogSvgBuffer = Buffer.from(getOgImageSvg());
  await sharp(ogSvgBuffer).resize(1200, 630).png().toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Created public/og-image.png (1200x630)');

  console.log('All S-Network brand assets generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
