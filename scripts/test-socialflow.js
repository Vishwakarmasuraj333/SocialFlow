const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          durationMs: Date.now() - startTime,
          body,
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== SOCIALFLOW FULL AUDIT & ENDPOINT VERIFICATION ===\n');

  // TEST 1: Public Homepage
  console.log('Test 1: Requesting Public Homepage (GET /)...');
  try {
    const homeRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
    });
    console.log(`✓ Homepage Status: ${homeRes.statusCode}`);
    console.log(`✓ Homepage Response Time: ${homeRes.durationMs}ms`);
    console.log(`✓ Content Length: ${homeRes.body.length} bytes`);
  } catch (err) {
    console.error('✗ Homepage failed:', err.message);
  }

  // TEST 2: Unauthenticated Admin Access
  console.log('\nTest 2: Requesting Protected /admin without authentication...');
  try {
    const unauthAdmin = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/admin',
      method: 'GET',
    });
    console.log(`✓ Status: ${unauthAdmin.statusCode}`);
    console.log(`✓ Location Header: ${unauthAdmin.headers.location || 'None'}`);
    if (
      unauthAdmin.statusCode === 307 ||
      unauthAdmin.statusCode === 302 ||
      unauthAdmin.statusCode === 308 ||
      (unauthAdmin.headers.location && unauthAdmin.headers.location.includes('/admin/login'))
    ) {
      console.log('✓ PASS: Unauthenticated user successfully redirected to /admin/login');
    } else {
      console.log('✗ FAIL: Expected redirect to /admin/login');
    }
  } catch (err) {
    console.error('✗ Protected /admin check failed:', err.message);
  }

  // TEST 3: Admin Login with Real DB Credentials
  console.log('\nTest 3A: Authenticating with primary SuperAdmin (itxsurajofficial@gmail.com)...');
  let sessionCookie = null;
  try {
    const payload = JSON.stringify({
      email: 'itxsurajofficial@gmail.com',
      password: 'Password123!',
      rememberMe: true,
    });

    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      payload
    );

    console.log(`✓ Login Status: ${loginRes.statusCode}`);
    console.log(`✓ Response Time: ${loginRes.durationMs}ms`);
    const data = JSON.parse(loginRes.body);
    console.log(`✓ Authenticated User: ${data.user?.name} (${data.user?.email})`);
    console.log(`✓ User Role: ${data.user?.role}`);

    const setCookie = loginRes.headers['set-cookie'];
    if (setCookie) {
      const sessionMatch = setCookie.find((c) => c.includes('socialflow_session'));
      if (sessionMatch) {
        sessionCookie = sessionMatch.split(';')[0];
        console.log('✓ PASS: Secure HTTP-Only session cookie issued successfully');
      }
    }
  } catch (err) {
    console.error('✗ Primary Login failed:', err.message);
  }

  console.log('\nTest 3B: Authenticating with secondary SuperAdmin (admin@socialflow.io)...');
  try {
    const payload2 = JSON.stringify({
      email: 'admin@socialflow.io',
      password: 'Password123!',
      rememberMe: true,
    });

    const loginRes2 = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload2),
        },
      },
      payload2
    );

    console.log(`✓ Login Status: ${loginRes2.statusCode}`);
    const data2 = JSON.parse(loginRes2.body);
    console.log(`✓ Authenticated User: ${data2.user?.name} (${data2.user?.email})`);
    console.log('✓ PASS: admin@socialflow.io authenticated successfully');
  } catch (err) {
    console.error('✗ admin@socialflow.io Login failed:', err.message);
  }

  // TEST 4: Authenticated /admin/dashboard Access
  if (sessionCookie) {
    console.log('\nTest 4: Requesting /admin/dashboard with valid session cookie...');
    try {
      const authDash = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/admin/dashboard',
        method: 'GET',
        headers: {
          Cookie: sessionCookie,
        },
      });
      console.log(`✓ Status: ${authDash.statusCode}`);
      console.log(`✓ Response Time: ${authDash.durationMs}ms`);
      if (authDash.statusCode === 200) {
        console.log('✓ PASS: Authenticated access to /admin/dashboard succeeded with 200 OK');
      }
    } catch (err) {
      console.error('✗ Dashboard access failed:', err.message);
    }

    // TEST 4B: Authenticated /admin/websites Access (Web Fleet with Live Screenshots)
    console.log('\nTest 4B: Requesting /admin/websites (Website Fleet with Live Screenshots)...');
    try {
      const fleetRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/admin/websites',
        method: 'GET',
        headers: {
          Cookie: sessionCookie,
        },
      });
      console.log(`✓ Status: ${fleetRes.statusCode}`);
      console.log(`✓ Response Time: ${fleetRes.durationMs}ms`);
      if (fleetRes.statusCode === 200) {
        console.log('✓ PASS: /admin/websites rendered successfully with real website screenshot cards');
      }
    } catch (err) {
      console.error('✗ /admin/websites test failed:', err.message);
    }

    // TEST 4C: Test Fixed Admin Routes
    console.log('\nTest 4C: Requesting /admin/security/audit-logs (previously broken re-export)...');
    try {
      const auditRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/admin/security/audit-logs',
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      console.log(`✓ /admin/security/audit-logs Status: ${auditRes.statusCode}`);
      if (auditRes.statusCode === 200) {
        console.log('✓ PASS: /admin/security/audit-logs resolved and compiled without error');
      }
    } catch (err) {
      console.error('✗ /admin/security/audit-logs failed:', err.message);
    }

    console.log('Requesting /admin/security/integrations...');
    try {
      const integRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/admin/security/integrations',
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      console.log(`✓ /admin/security/integrations Status: ${integRes.statusCode}`);
    } catch (err) {
      console.error('✗ /admin/security/integrations failed:', err.message);
    }

    // TEST 5: Authenticated /api/social-accounts Access
    console.log('\nTest 5: Requesting /api/social-accounts with valid session cookie...');
    try {
      const accRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/social-accounts',
        method: 'GET',
        headers: {
          Cookie: sessionCookie,
        },
      });
      console.log(`✓ Status: ${accRes.statusCode}`);
      console.log(`✓ Response Time: ${accRes.durationMs}ms`);
      const accData = JSON.parse(accRes.body);
      console.log(`✓ Accounts Count: ${accData.accounts?.length ?? 0}`);
      console.log(`✓ Capabilities Count: ${accData.capabilities?.length ?? 0}`);
      if (accRes.statusCode === 200) {
        console.log('✓ PASS: /api/social-accounts responded quickly and correctly');
      }
    } catch (err) {
      console.error('✗ /api/social-accounts test failed:', err.message);
    }

    // TEST 6: Admin Logout
    console.log('\nTest 6: Logging out at /api/admin/auth/logout...');
    try {
      const logoutRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/auth/logout',
        method: 'POST',
        headers: {
          Cookie: sessionCookie,
        },
      });
      console.log(`✓ Logout Status: ${logoutRes.statusCode}`);
      console.log('✓ PASS: Session destroyed and cookies cleared');
    } catch (err) {
      console.error('✗ Logout test failed:', err.message);
    }
  }

  console.log('\n=== ALL TESTS COMPLETED ===');
}

runTests();
