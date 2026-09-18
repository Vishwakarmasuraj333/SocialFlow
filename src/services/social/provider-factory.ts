import { PlatformType, ProviderCapabilities } from './types';
import { SocialProvider } from './base-provider';
import { InstagramProvider } from './providers/instagram-provider';
import {
  FacebookProvider,
  XProvider,
  LinkedInProvider,
  YouTubeProvider,
  TikTokProvider,
  PinterestProvider,
  ThreadsProvider,
  SnapchatProvider,
  RedditProvider,
  WhatsAppProvider,
  TelegramProvider,
  DiscordProvider,
  BlueskyProvider,
  MastodonProvider,
  TumblrProvider,
  MediumProvider,
  QuoraProvider,
  WordPressProvider,
  VimeoProvider,
} from './providers/all-providers';

class ProviderFactory {
  private providers: Map<PlatformType, SocialProvider> = new Map();

  constructor() {
    this.register(new InstagramProvider());
    this.register(new FacebookProvider());
    this.register(new LinkedInProvider());
    this.register(new XProvider());
    this.register(new YouTubeProvider());
    this.register(new TikTokProvider());
    this.register(new PinterestProvider());
    this.register(new ThreadsProvider());
    this.register(new SnapchatProvider());
    this.register(new RedditProvider());
    this.register(new WhatsAppProvider());
    this.register(new TelegramProvider());
    this.register(new DiscordProvider());
    this.register(new BlueskyProvider());
    this.register(new MastodonProvider());
    this.register(new TumblrProvider());
    this.register(new MediumProvider());
    this.register(new QuoraProvider());
    this.register(new WordPressProvider());
    this.register(new VimeoProvider());
  }

  private register(provider: SocialProvider) {
    this.providers.set(provider.platform, provider);
  }

  getProvider(platform: PlatformType | string): SocialProvider {
    const key = (platform === 'TWITTER' ? 'X' : platform.toUpperCase()) as PlatformType;
    const provider = this.providers.get(key);
    if (!provider) {
      // Fallback for TWITTER alias to X
      if (key === 'TWITTER' && this.providers.has('X')) {
        return this.providers.get('X')!;
      }
      throw new Error(`Unsupported social platform: ${platform}`);
    }
    return provider;
  }

  getAllProviders(): SocialProvider[] {
    return Array.from(this.providers.values());
  }

  getAllCapabilities(): ProviderCapabilities[] {
    return this.getAllProviders().map((p) => p.capabilities);
  }

  getCapabilities(platform: PlatformType | string): ProviderCapabilities {
    return this.getProvider(platform).capabilities;
  }

  isPlatformConfigured(platform: PlatformType | string): boolean {
    const p = (platform === 'TWITTER' ? 'X' : platform.toUpperCase()) as PlatformType;
    switch (p) {
      case 'LINKEDIN':
        return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
      case 'FACEBOOK':
      case 'INSTAGRAM':
      case 'THREADS':
        return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
      case 'X':
      case 'TWITTER':
        return Boolean(
          (process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET) ||
          (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET)
        );
      case 'TIKTOK':
        return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
      case 'YOUTUBE':
        return Boolean(
          (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ||
          (process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET)
        );
      case 'PINTEREST':
        return Boolean(
          process.env.PINTEREST_ACCESS_TOKEN ||
          (process.env.PINTEREST_APP_ID && (process.env.PINTEREST_APP_SECRET || process.env.PINTEREST_ACCESS_TOKEN))
        );
      case 'SNAPCHAT':
        return Boolean(process.env.SNAPCHAT_CLIENT_ID && process.env.SNAPCHAT_CLIENT_SECRET);
      case 'REDDIT':
        return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
      case 'WHATSAPP':
        return Boolean(process.env.META_APP_ID && process.env.WHATSAPP_PHONE_NUMBER_ID);
      case 'TELEGRAM':
        return Boolean(process.env.TELEGRAM_BOT_TOKEN);
      case 'DISCORD':
        return Boolean(process.env.DISCORD_CLIENT_ID || process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_WEBHOOK_URL);
      case 'BLUESKY':
        return Boolean(process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_APP_PASSWORD);
      case 'MASTODON':
        return Boolean(process.env.MASTODON_ACCESS_TOKEN || (process.env.MASTODON_CLIENT_ID && process.env.MASTODON_CLIENT_SECRET));
      case 'TUMBLR':
        return Boolean(process.env.TUMBLR_CONSUMER_KEY && process.env.TUMBLR_CONSUMER_SECRET);
      case 'MEDIUM':
        return Boolean(process.env.MEDIUM_CLIENT_ID && process.env.MEDIUM_CLIENT_SECRET);
      case 'QUORA':
        return Boolean(process.env.QUORA_ACCESS_TOKEN);
      case 'WORDPRESS':
        return Boolean(process.env.WORDPRESS_SITE_URL && process.env.WORDPRESS_APP_PASSWORD);
      case 'VIMEO':
        return Boolean(process.env.VIMEO_CLIENT_ID && process.env.VIMEO_CLIENT_SECRET);
      default:
        return false;
    }
  }
}

export const providerFactory = new ProviderFactory();
