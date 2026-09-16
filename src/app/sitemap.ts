import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialflow.app';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
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
    '/login',
    '/register',
    '/dashboard',
    '/publishing',
    '/calendar',
    '/analytics',
    '/inbox',
    '/approvals',
    '/campaigns',
    '/media',
    '/social-accounts',
    '/team',
    '/reports',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/pricing' || route === '/features' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/(dashboard)') || route === '/pricing' ? 0.9 : 0.8,
  }));
}
