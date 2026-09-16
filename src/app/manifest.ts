import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SocialFlow — Real-Time Social Media Management',
    short_name: 'SocialFlow',
    description: 'SocialFlow is a powerful real-time social media management platform for scheduling, publishing, monitoring, analytics and managing social content from one place.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070A13',
    theme_color: '#6366F1',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
