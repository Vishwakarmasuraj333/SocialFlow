import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { providerFactory } from '@/services/social/provider-factory';

export const INTEGRATION_SPECS = [
  {
    key: 'linkedin',
    name: 'LinkedIn',
    category: 'Social & Professional',
    api: 'Community Management API REST v2',
    envKeys: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'w_organization_social'],
    docUrl: 'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin',
    brandColor: '#0A66C2',
  },
  {
    key: 'facebook',
    name: 'Meta / Facebook',
    category: 'Social & Professional',
    api: 'Meta Graph API v19.0',
    envKeys: ['META_APP_ID', 'META_APP_SECRET'],
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'pages_messaging'],
    docUrl: 'https://developers.facebook.com/docs/graph-api',
    brandColor: '#1877F2',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    category: 'Social & Professional',
    api: 'Instagram Graph API v19.0',
    envKeys: ['META_APP_ID', 'META_APP_SECRET'],
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments', 'instagram_manage_messages'],
    docUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api',
    brandColor: '#E4405F',
  },
  {
    key: 'x',
    name: 'X (Twitter)',
    category: 'Social & Professional',
    api: 'X API v2 (OAuth 2.0 PKCE)',
    envKeys: ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    docUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0',
    brandColor: '#000000',
  },
  {
    key: 'threads',
    name: 'Threads',
    category: 'Social & Professional',
    api: 'Official Threads API v1',
    envKeys: ['META_APP_ID', 'META_APP_SECRET'],
    scopes: ['threads_basic', 'threads_content_publish', 'threads_read_replies'],
    docUrl: 'https://developers.facebook.com/docs/threads',
    brandColor: '#101010',
  },
  {
    key: 'pinterest',
    name: 'Pinterest',
    category: 'Social & Professional',
    api: 'Pinterest API v5',
    envKeys: ['PINTEREST_APP_ID', 'PINTEREST_ACCESS_TOKEN'],
    scopes: ['boards:read', 'pins:read', 'pins:write'],
    docUrl: 'https://developers.pinterest.com/docs/api/v5/',
    brandColor: '#E60023',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    category: 'Video & Streaming',
    api: 'Google YouTube Data API v3',
    envKeys: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
    docUrl: 'https://developers.google.com/youtube/v3',
    brandColor: '#FF0000',
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    category: 'Video & Streaming',
    api: 'TikTok Content Posting API v2',
    envKeys: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    scopes: ['user.info.basic', 'video.publish', 'video.upload'],
    docUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
    brandColor: '#000000',
  },
  {
    key: 'vimeo',
    name: 'Vimeo',
    category: 'Video & Streaming',
    api: 'Vimeo API v3.4',
    envKeys: ['VIMEO_CLIENT_ID', 'VIMEO_CLIENT_SECRET'],
    scopes: ['public', 'private', 'upload', 'edit'],
    docUrl: 'https://developer.vimeo.com/api/guides/start',
    brandColor: '#1AB7EA',
  },
  {
    key: 'snapchat',
    name: 'Snapchat',
    category: 'Video & Streaming',
    api: 'Snap Kit Marketing API v2',
    envKeys: ['SNAPCHAT_CLIENT_ID', 'SNAPCHAT_CLIENT_SECRET'],
    scopes: ['https://auth.snapchat.com/oauth2/api/user.display_name'],
    docUrl: 'https://developers.snap.com/api',
    brandColor: '#FFFC00',
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp Channels',
    category: 'Messaging & Community',
    api: 'Meta WhatsApp Cloud API v19.0',
    envKeys: ['META_APP_ID', 'WHATSAPP_PHONE_NUMBER_ID'],
    scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    docUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    brandColor: '#25D366',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    category: 'Messaging & Community',
    api: 'Telegram Bot API v7',
    envKeys: ['TELEGRAM_BOT_TOKEN'],
    scopes: ['send_messages', 'send_photos', 'send_videos', 'manage_chat'],
    docUrl: 'https://core.telegram.org/bots/api',
    brandColor: '#26A5E4',
  },
  {
    key: 'discord',
    name: 'Discord',
    category: 'Messaging & Community',
    api: 'Discord Bot & Webhook v10',
    envKeys: ['DISCORD_CLIENT_ID', 'DISCORD_BOT_TOKEN'],
    scopes: ['bot', 'messages.read', 'applications.commands'],
    docUrl: 'https://discord.com/developers/docs/intro',
    brandColor: '#5865F2',
  },
  {
    key: 'reddit',
    name: 'Reddit',
    category: 'Messaging & Community',
    api: 'Reddit OAuth API v2',
    envKeys: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'],
    scopes: ['identity', 'submit', 'read'],
    docUrl: 'https://www.reddit.com/dev/api/',
    brandColor: '#FF4500',
  },
  {
    key: 'bluesky',
    name: 'Bluesky',
    category: 'Decentralized & Publishing',
    api: 'AT Protocol v1',
    envKeys: ['BLUESKY_IDENTIFIER', 'BLUESKY_APP_PASSWORD'],
    scopes: ['com.atproto.repo.createRecord', 'com.atproto.repo.uploadBlob'],
    docUrl: 'https://atproto.com/guides/overview',
    brandColor: '#0085FF',
  },
  {
    key: 'mastodon',
    name: 'Mastodon',
    category: 'Decentralized & Publishing',
    api: 'Mastodon REST API v2',
    envKeys: ['MASTODON_ACCESS_TOKEN'],
    scopes: ['read', 'write', 'push'],
    docUrl: 'https://docs.joinmastodon.org/client/intro/',
    brandColor: '#6364FF',
  },
  {
    key: 'tumblr',
    name: 'Tumblr',
    category: 'Decentralized & Publishing',
    api: 'Tumblr API v2',
    envKeys: ['TUMBLR_CONSUMER_KEY', 'TUMBLR_CONSUMER_SECRET'],
    scopes: ['basic', 'write'],
    docUrl: 'https://www.tumblr.com/docs/en/api/v2',
    brandColor: '#36465D',
  },
  {
    key: 'medium',
    name: 'Medium',
    category: 'Decentralized & Publishing',
    api: 'Medium Publishing API v1',
    envKeys: ['MEDIUM_CLIENT_ID', 'MEDIUM_CLIENT_SECRET'],
    scopes: ['basicProfile', 'publishPost'],
    docUrl: 'https://github.com/Medium/medium-api-docs',
    brandColor: '#000000',
  },
  {
    key: 'quora',
    name: 'Quora',
    category: 'Decentralized & Publishing',
    api: 'Quora Publishing API v1',
    envKeys: ['QUORA_ACCESS_TOKEN'],
    scopes: ['posts.write', 'profile.read'],
    docUrl: 'https://www.quora.com',
    brandColor: '#B92B27',
  },
  {
    key: 'wordpress',
    name: 'WordPress',
    category: 'Decentralized & Publishing',
    api: 'WordPress REST API /wp/v2',
    envKeys: ['WORDPRESS_SITE_URL', 'WORDPRESS_APP_PASSWORD'],
    scopes: ['publish_posts', 'upload_files'],
    docUrl: 'https://developer.wordpress.org/rest-api/',
    brandColor: '#21759B',
  },
];

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const integrations = INTEGRATION_SPECS.map((spec) => {
      const isConfigured = providerFactory.isPlatformConfigured(spec.key);
      const envStatus = spec.envKeys.map((key) => ({
        key,
        configured: Boolean(process.env[key]),
      }));

      return {
        ...spec,
        isConfigured,
        status: isConfigured ? 'READY' : 'CONFIGURATION_REQUIRED',
        envStatus,
      };
    });

    const summary = {
      total: integrations.length,
      configured: integrations.filter((i) => i.isConfigured).length,
      pending: integrations.filter((i) => !i.isConfigured).length,
    };

    return NextResponse.json({ summary, integrations });
  } catch (error: any) {
    console.error('Error fetching admin integrations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch integrations' }, { status: 500 });
  }
}
