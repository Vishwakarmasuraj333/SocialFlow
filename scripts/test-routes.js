const http = require('http');

const routes = [
  '/',
  '/dashboard',
  '/content',
  '/content/create',
  '/calendar',
  '/approvals',
  '/inbox',
  '/social-accounts',
  '/campaigns',
  '/analytics',
  '/media',
  '/reports',
  '/team',
  '/trash',
  '/settings',
  '/admin',
  '/admin/dashboard',
  '/admin/company',
  '/admin/company/profile',
  '/admin/company/locations',
  '/admin/company/activity',
  '/admin/websites',
  '/admin/websites/domains',
  '/admin/websites/dns',
  '/admin/websites/infrastructure',
  '/admin/websites/deployments',
  '/admin/websites/content',
  '/admin/websites/seo',
  '/admin/social/accounts',
  '/admin/social/publisher',
  '/admin/social/calendar',
  '/admin/social/posts',
  '/admin/social/campaigns',
  '/admin/social/analytics',
  '/admin/media',
  '/admin/system-health',
  '/admin/infrastructure/servers',
  '/admin/infrastructure/databases',
  '/admin/infrastructure/storage',
  '/admin/infrastructure/cdn',
  '/admin/infrastructure/services',
  '/admin/security/login-activity',
  '/admin/security/sessions',
  '/admin/security/audit-logs',
  '/admin/security/integrations',
  '/admin/reports',
  '/admin/admins',
  '/admin/workspaces',
  '/admin/users',
  '/admin/admins/roles',
  '/admin/admins/permissions',
  '/admin/trash',
  '/admin/settings/company',
  '/admin/settings/profile',
  '/admin/settings/security',
  '/admin/settings/notifications',
  '/admin/settings/integrations',
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/features',
  '/platforms',
  '/solutions',
  '/pricing',
  '/resources',
  '/security',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      timeout: 35000,
    }, (res) => {
      resolve({ path, status: res.statusCode, location: res.headers.location });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ path, error: 'TIMEOUT' });
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
  });
}

async function run() {
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`${res.path} -> ${res.status || res.error} ${res.location ? '(Redirect: ' + res.location + ')' : ''}`);
  }
}

run();
