import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('====================================================');
  console.log('   SOCIALFLOW REAL SYSTEM & DATABASE VERIFICATION   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✓ PASS: ${name}`);
        passed++;
      } catch (err) {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(`    -> ${err.message}`);
        failed++;
      }
    })();
  }

  // 1. Check generated high-res composer and website images in public folder
  await test('Composer and Website Visual Assets Exist and are Valid', () => {
    const images = [
      'composer/omni_engine.jpg',
      'composer/analytics_growth.jpg',
      'composer/creator_studio.jpg',
      'composer/enterprise_security.jpg',
      'websites/socialflow-app.jpg',
      'websites/socialflow-blog.jpg',
      'websites/socialflow-docs.jpg',
    ];
    for (const img of images) {
      const p = path.join(process.cwd(), 'public', 'images', ...img.split('/'));
      assert(fs.existsSync(p), `Image missing: ${img}`);
      const stats = fs.statSync(p);
      assert(stats.size > 10000, `Image too small (${stats.size} bytes): ${img}`);
    }
  });

  // 2. Test Landing Page (SSR)
  await test('Landing Page Renders Cleanly without "Sign In" and with "Admin Console"', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const html = await res.text();
    assert(html.includes('Admin Console'), 'Header should include Admin Console');
    assert(!html.includes('href="/login">Sign In'), 'Sign In link should be removed from header');
    assert(html.includes('SocialFlow'), 'SocialFlow brand present');
    assert(html.includes('Studio Post Composer'), 'Composer section present');
  });

  // 3. Test Live Metrics API (Real Prisma Database Aggregation)
  await test('Public Stats Overview Returns Real Aggregated Database Metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/stats/overview`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(typeof data.metrics.totalReach, 'number');
    assert(data.metrics.connectedNetworks >= 4, `Expected at least 4 networks, got ${data.metrics.connectedNetworks}`);
    assert.strictEqual(data.metrics.totalWebsites, 3, `Expected 3 websites, got ${data.metrics.totalWebsites}`);
    assert.strictEqual(data.metrics.totalPosts, 2, `Expected 2 posts, got ${data.metrics.totalPosts}`);
    assert.strictEqual(typeof data.metrics.totalFollowers, 'number');
    console.log('    Live Stats:', JSON.stringify(data.metrics));
  });

  // 4. Test Authentication Rejection for Invalid Password
  await test('Admin Login Rejects Invalid Password', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'itxsurajofficial@gmail.com', password: 'WrongPassword!' }),
    });
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized');
  });

  // 5. Test Admin Login with Seeded / .env SuperAdmin Credentials
  let sessionCookie = '';
  await test('Admin Login Authenticates SuperAdmin (itxsurajofficial@gmail.com)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'itxsurajofficial@gmail.com', password: 'Password123!' }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    assert(setCookie, 'Expected set-cookie header');
    assert(setCookie.includes('socialflow_session'), 'Expected socialflow_session cookie');
    sessionCookie = setCookie.split(';')[0];
    const data = await res.json();
    assert.strictEqual(data.user.email, 'itxsurajofficial@gmail.com');
    assert.strictEqual(data.user.name, 'Suraj Vishwakarma');
    assert.strictEqual(data.user.isSuperAdmin, true);
  });

  const authHeaders = { Cookie: sessionCookie };

  // 6. Test Admin Dashboard Stats API
  await test('Admin Dashboard Stats API Returns Accurate Real DB Records', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, { headers: authHeaders });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.stats.totalWebsites, 3);
    assert.strictEqual(data.stats.socialAccounts, 5);
    assert.strictEqual(data.stats.scheduledPosts, 1);
    assert.strictEqual(data.stats.publishedPosts, 1);
    assert.strictEqual(data.recentWebsites.length, 3);
  });

  // 7. Test Admin Websites Fleet API
  await test('Admin Websites API Returns All 3 Real Configured Websites', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/websites`, { headers: authHeaders });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.websites.length, 3);
    const domains = data.websites.map(w => w.domain);
    assert(domains.includes('socialflow.io'));
    assert(domains.includes('blog.socialflow.io'));
    assert(domains.includes('docs.socialflow.io'));
  });

  // 8. Test Admin Social Accounts API
  await test('Admin Social Accounts API Returns 5 Connected Enterprise Channels', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/social-accounts`, { headers: authHeaders });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.accounts.length, 5);
    const platforms = data.accounts.map(a => a.platform);
    assert(platforms.includes('LINKEDIN'));
    assert(platforms.includes('TWITTER'));
    assert(platforms.includes('INSTAGRAM'));
    assert(platforms.includes('FACEBOOK'));
    assert(platforms.includes('YOUTUBE'));
  });

  // 9. Test Admin Posts API
  await test('Admin Posts API Returns Seeded Production Posts & Audit Stream', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/posts`, { headers: authHeaders });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.posts.length, 2);
  });

  // 10. Test Admin Infrastructure Fleet API
  await test('Admin Infrastructure API Returns Active Multi-Cloud Assets', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/infrastructure`, { headers: authHeaders });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.assets.length, 3);
  });

  // 11. Test Admin Panel SSR Routes with Authentication Cookie
  const adminRoutes = [
    '/admin/dashboard',
    '/admin/websites',
    '/admin/websites/domains',
    '/admin/social/accounts',
    '/admin/social-accounts',
    '/admin/posts',
    '/admin/system-health',
    '/admin/media',
  ];

  for (const route of adminRoutes) {
    await test(`SSR Admin Page Loads Successfully: ${route}`, async () => {
      const res = await fetch(`${BASE_URL}${route}`, { headers: authHeaders });
      assert.strictEqual(res.status, 200, `Route ${route} returned HTTP ${res.status}`);
      const text = await res.text();
      assert(text.length > 500, `Page content too small for ${route}`);
    });
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
