import React from 'react';

export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialflow.app';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'SocialFlow',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/favicon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://twitter.com/socialflowapp',
          'https://linkedin.com/company/socialflowapp',
          'https://github.com/socialflowapp',
        ],
        description:
          'Enterprise Multi-Channel Social Media Management, Real-Time Publishing, Unified Social Inbox & AI Analytics.',
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'SocialFlow',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}/#software`,
        name: 'SocialFlow',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All Modern Web Browsers (Chrome, Edge, Safari, Firefox)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1240',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: [
          'Omnichannel Real-Time Publishing & Scheduling',
          'Multi-Tier Approval Workflows',
          'Unified Social Inbox with Sentiment Analysis',
          'Live Social Account Sync & Analytics',
          'Drag-and-Drop Interactive Visual Calendar',
          'Enterprise RBAC & AES-256 Encrypted Credentials',
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
