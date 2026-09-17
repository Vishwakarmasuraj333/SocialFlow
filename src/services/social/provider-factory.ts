import { PlatformType, ProviderCapabilities } from './types';
import { SocialProvider } from './base-provider';
import { LinkedInProvider } from './linkedin-provider';
import { FacebookProvider } from './facebook-provider';
import { InstagramProvider } from './instagram-provider';
import { TwitterProvider } from './twitter-provider';
import { TikTokProvider } from './tiktok-provider';
import { YouTubeProvider } from './youtube-provider';
import { PinterestProvider } from './pinterest-provider';
import { ThreadsProvider } from './threads-provider';

class ProviderFactory {
  private providers: Map<PlatformType, SocialProvider> = new Map();

  constructor() {
    this.register(new LinkedInProvider());
    this.register(new FacebookProvider());
    this.register(new InstagramProvider());
    this.register(new TwitterProvider());
    this.register(new TikTokProvider());
    this.register(new YouTubeProvider());
    this.register(new PinterestProvider());
    this.register(new ThreadsProvider());
  }

  private register(provider: SocialProvider) {
    this.providers.set(provider.platform, provider);
  }

  getProvider(platform: PlatformType): SocialProvider {
    const provider = this.providers.get(platform);
    if (!provider) {
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

  getCapabilities(platform: PlatformType): ProviderCapabilities {
    return this.getProvider(platform).capabilities;
  }

  isPlatformConfigured(platform: PlatformType): boolean {
    switch (platform) {
      case 'LINKEDIN':
        return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
      case 'FACEBOOK':
      case 'INSTAGRAM':
      case 'THREADS':
        return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
      case 'TWITTER':
        return Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET);
      case 'TIKTOK':
        return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
      case 'YOUTUBE':
        return Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET);
      case 'PINTEREST':
        return Boolean(process.env.PINTEREST_APP_ID && (process.env.PINTEREST_APP_SECRET || process.env.PINTEREST_ACCESS_TOKEN));
      default:
        return false;
    }
  }
}

export const providerFactory = new ProviderFactory();
