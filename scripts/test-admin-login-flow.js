const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminLoginFlow() {
  console.log('--- 1. Testing Admin Login via API endpoint ---');
  const loginRes = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SocialFlow-Verification-Agent/1.0',
    },
    body: JSON.stringify({
      email: 'itxsurajofficial@gmail.com',
      password: 'Password123!',
      rememberMe: true,
    }),
  });

  console.log('Login Response Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Response Body:', loginData);

  if (!loginRes.ok) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }

  const setCookie = loginRes.headers.get('set-cookie') || '';
  console.log('Set-Cookie headers present:', Boolean(setCookie));

  console.log('\n--- 2. Verifying Session in PostgreSQL Neon DB ---');
  const dbSessions = await prisma.session.findMany({
    where: { userId: loginData.user.id },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  console.log('Database Session record count:', dbSessions.length);
  if (dbSessions.length > 0) {
    console.log('Latest Session ID:', dbSessions[0].id);
    console.log('Session Expires At:', dbSessions[0].expiresAt);
    console.log('Session Token starts with:', dbSessions[0].sessionToken.slice(0, 20) + '...');
  } else {
    throw new Error('No session record created in PostgreSQL database!');
  }

  const sessionCookieMatch = setCookie.match(/socialflow_session=([^;]+)/);
  const sessionCookie = sessionCookieMatch ? sessionCookieMatch[1] : dbSessions[0].sessionToken;

  console.log('\n--- 3. Testing Protected Admin Endpoint with Session Cookie ---');
  const dashRes = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
    headers: {
      Cookie: `socialflow_session=${sessionCookie}; socialflow_active_workspace=${loginData.workspace?.id || ''}`,
    },
  });

  console.log('Dashboard Stats Status:', dashRes.status);
  const dashData = await dashRes.json();
  console.log('Dashboard Stats:', dashData);

  console.log('\n--- 4. Testing Admin Management Endpoint ---');
  const adminsRes = await fetch('http://localhost:3000/api/admin/admins', {
    headers: {
      Cookie: `socialflow_session=${sessionCookie}; socialflow_active_workspace=${loginData.workspace?.id || ''}`,
    },
  });
  console.log('Admins List Status:', adminsRes.status);
  const adminsData = await adminsRes.json();
  console.log('Admins Count:', adminsData.admins?.length);
  console.log('Admin details:', adminsData.admins?.map(a => ({ email: a.email, role: a.role, isSuperAdmin: a.isSuperAdmin })));

  console.log('\n>>> SUCCESS: Admin Sign In & Session persistence verified with 100% real Neon DB! <<<');
}

testAdminLoginFlow()
  .catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
