# SocialFlow — Enterprise Social Media Management & Web Fleet Engine

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SocialFlow** is an all-in-one enterprise social media orchestration and web fleet monitoring platform. Schedule, broadcast, track, and measure cross-network social presence across 12+ channels with real-time performance analytics, live preview post composer, and hardware-grade AES-256 encryption.

---

## Key Features

### 🚀 Studio Post Composer (Omni-Engine)
- **Multi-Network Targeting**: Simultaneously select and publish to LinkedIn, X (Twitter), Instagram, Facebook, YouTube, TikTok, Pinterest, and Threads.
- **Real-Time Visual Previews**: Live preview simulator matching native network UI for each targeted channel.
- **Photo Asset Selector**: Toggle between high-resolution creative photography assets for visual validation before broadcasting.
- **Global Character Counter & Tags**: Adaptive limits per network with hashtag and emoji helper toolbars.

### 🌐 Website Fleet Management
- **Production Asset Monitoring**: Track multi-cloud web properties (Vercel Edge, Cloudflare Pages) in real-time.
- **Direct Domain Previews**: High-resolution UI asset captures without external WordPress or CMS dependencies.
- **Fleet Controls**: Edit hosting, framework stack, URLs, and SSL validity with full audit history.

### 🛡️ Connected Social Channels & Security
- **Multi-Platform OAuth & Session Renewal**: 1-click reconnect, token verification, and session renewal.
- **Distinct Disconnect & Permanent Delete**:
  - **Pause/Disconnect**: Halts automations while preserving historical performance graphs.
  - **Permanent Delete**: Completely detaches credentials and removes channels from active fleet.
- **Hardware-Grade Encryption**: AES-256-GCM hardware encryption for stored access keys and refresh tokens.
- **Granular Audit Logs**: Comprehensive timeline logging every administrative publish, sync, disconnect, or configuration change.

### 📊 Real-Time Analytics & Audience Fleet
- **Zero Mock Metrics**: Real aggregated database metrics reflecting live followers, impressions, reach, and engagement curves.
- **Multi-Channel Audience Aggregation**: Real-time cross-platform subscriber syncing.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend**: [React 19](https://react.dev/), [TailwindCSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (`prisma/dev.db`)
- **Security**: AES-256-GCM cipher encryption, Jose JWT, BCrypt password hashing
- **Linting & Types**: Full TypeScript strict mode validation

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Vishwakarmasuraj333/SocialFlow.git
cd SocialFlow
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Setup & Seed
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default SuperAdmin Access

To access the Admin Console at [http://localhost:3000/admin/login](http://localhost:3000/admin/login):

- **Email**: `itxsurajofficial@gmail.com`
- **Password**: `Password123!`
- **Role**: `SUPERADMIN`

---

## Verification & Quality Checks

Run the automated suite to verify all 18 enterprise health checks:
```bash
node scripts/verify-all.mjs
```

Type check:
```bash
npx tsc --noEmit
```

---

## Author & Maintainer

- **Suraj Vishwakarma** — [Vishwakarmasuraj333](https://github.com/Vishwakarmasuraj333)

## License
MIT License. Feel free to use and extend for enterprise workflows.
