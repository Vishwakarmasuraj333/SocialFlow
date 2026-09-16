import prisma from '@/lib/db';
import { providerFactory } from './social/provider-factory';
import { PlatformType } from './social/types';

export interface HealthCheckResult {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  uptimeSeconds: number;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  components: {
    database: {
      status: 'HEALTHY' | 'UNHEALTHY';
      latencyMs: number;
      error?: string;
    };
    schedulerQueue: {
      status: 'HEALTHY' | 'WARNING';
      pendingDueCount: number;
    };
    storage: {
      status: 'HEALTHY';
      driver: string;
    };
    socialProviders: Array<{
      platform: PlatformType;
      displayName: string;
      isConfigured: boolean;
      status: 'CONFIGURED' | 'MISSING_CREDENTIALS';
    }>;
  };
}

export async function checkSystemHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  let dbStatus: 'HEALTHY' | 'UNHEALTHY' = 'HEALTHY';
  let dbLatencyMs = 0;
  let dbError: string | undefined;

  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
  } catch (err: unknown) {
    dbStatus = 'UNHEALTHY';
    dbError = err instanceof Error ? err.message : 'Database query failed';
  }

  // Check pending due posts
  let pendingDueCount = 0;
  try {
    pendingDueCount = await prisma.post.count({
      where: {
        status: 'SCHEDULED',
        isSoftDeleted: false,
        scheduledAt: { lte: new Date() },
      },
    });
  } catch {
    // ignore
  }

  // Social Providers health
  const platforms: PlatformType[] = [
    'LINKEDIN',
    'FACEBOOK',
    'INSTAGRAM',
    'TWITTER',
    'TIKTOK',
    'YOUTUBE',
    'PINTEREST',
    'THREADS',
  ];

  const socialProviders = platforms.map((p) => {
    const isConfigured = providerFactory.isPlatformConfigured(p);
    const caps = providerFactory.getCapabilities(p);
    return {
      platform: p,
      displayName: caps.displayName,
      isConfigured,
      status: (isConfigured ? 'CONFIGURED' : 'MISSING_CREDENTIALS') as 'CONFIGURED' | 'MISSING_CREDENTIALS',
    };
  });

  const mem = process.memoryUsage();
  const overallStatus =
    dbStatus === 'UNHEALTHY' ? 'UNHEALTHY' : pendingDueCount > 10 ? 'DEGRADED' : 'HEALTHY';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    components: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
      schedulerQueue: {
        status: pendingDueCount > 5 ? 'WARNING' : 'HEALTHY',
        pendingDueCount,
      },
      storage: {
        status: 'HEALTHY',
        driver: 'Local/Cloud Storage Engine',
      },
      socialProviders,
    },
  };
}
