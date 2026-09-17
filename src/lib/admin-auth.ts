import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signSessionToken, SESSION_COOKIE_NAME, WORKSPACE_COOKIE_NAME } from '@/lib/jwt';
import { cookies } from 'next/headers';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface AdminAuthResult {
  success: boolean;
  status: number;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatarUrl?: string | null;
    isSuperAdmin: boolean;
  };
  workspace?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Ensures the initial super-admin account exists based on environment configuration.
 * Plaintext password is NEVER stored in the database.
 */
export async function ensureInitialAdmin(): Promise<void> {
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@socialflow.io').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Admin@SocialFlow2026!';
  const adminName = process.env.INITIAL_ADMIN_NAME || process.env.ADMIN_NAME || 'Super Administrator';

  try {
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existing) {
      let defaultWorkspace = await prisma.workspace.findFirst();
      if (!defaultWorkspace) {
        defaultWorkspace = await prisma.workspace.create({
          data: {
            name: 'SocialFlow Enterprise',
            slug: 'socialflow-enterprise',
            timezone: 'UTC',
          },
        });
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);

      await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          isEmailVerified: true,
          status: 'ACTIVE',
          memberships: {
            create: {
              workspaceId: defaultWorkspace.id,
              role: 'OWNER',
              status: 'ACTIVE',
            },
          },
        },
      });
    }
  } catch (error) {
    console.error('Failed to ensure initial admin account:', error);
  }
}

/**
 * Validates admin credentials against database bcrypt hash with lockout protection.
 */
export async function validateAdminLogin(
  emailInput: string,
  passwordInput: string,
  rememberMe = false,
  ipAddress = '127.0.0.1',
  userAgent = 'Unknown'
): Promise<AdminAuthResult> {
  const email = emailInput.toLowerCase().trim();

  // Ensure initial admin is provisioned
  await ensureInitialAdmin();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { workspace: true },
      },
    },
  });

  // Generic failure for user not found (prevents email enumeration)
  if (!user) {
    await prisma.securityEvent.create({
      data: {
        action: 'LOGIN_FAILED',
        resource: email,
        ipAddress,
        userAgent,
        result: 'FAILED',
        metadataJson: JSON.stringify({ reason: 'Invalid credentials' }),
      },
    });

    return {
      success: false,
      status: 401,
      error: 'Invalid email or password.',
    };
  }

  // Account status verification
  if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
    await prisma.securityEvent.create({
      data: {
        adminId: user.id,
        action: 'LOGIN_BLOCKED',
        resource: email,
        ipAddress,
        userAgent,
        result: 'BLOCKED',
        metadataJson: JSON.stringify({ status: user.status }),
      },
    });

    return {
      success: false,
      status: 403,
      error: 'Your administrator account is inactive. Please contact system support.',
    };
  }

  // Lockout verification
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const minutesRemaining = Math.ceil(
      (new Date(user.lockedUntil).getTime() - Date.now()) / (1000 * 60)
    );
    return {
      success: false,
      status: 429,
      error: `Too many unsuccessful login attempts. Please try again in ${minutesRemaining} minute(s).`,
    };
  }

  // Verify password strictly against database bcrypt hash
  const isPasswordValid = await bcrypt.compare(passwordInput, user.passwordHash);

  if (!isPasswordValid) {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lockedUntil,
      },
    });

    await prisma.securityEvent.create({
      data: {
        adminId: user.id,
        action: 'LOGIN_FAILED',
        resource: email,
        ipAddress,
        userAgent,
        result: 'FAILED',
        metadataJson: JSON.stringify({
          failedAttempts,
          locked: shouldLock,
        }),
      },
    });

    return {
      success: false,
      status: shouldLock ? 429 : 401,
      error: shouldLock
        ? 'Too many unsuccessful login attempts. Please try again later.'
        : 'Invalid email or password.',
    };
  }

  // Successful Login: Reset failed attempts and update last login
  const activeWorkspace = user.memberships[0]?.workspace || null;
  const adminRole = user.role || (user.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    },
  });

  // Session duration: 30 days if rememberMe, otherwise 7 days
  const sessionDays = rememberMe ? 30 : 7;
  const sessionExpiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  const sessionToken = await signSessionToken(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin || adminRole === 'SUPER_ADMIN',
      workspaceId: activeWorkspace?.id,
      role: adminRole,
    },
    `${sessionDays}d`
  );

  // Store server-side session in database
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt: sessionExpiresAt,
      userAgent,
      ipAddress,
    },
  });

  // Set HTTP-Only Secure Cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionDays * 24 * 60 * 60,
  });

  if (activeWorkspace) {
    cookieStore.set(WORKSPACE_COOKIE_NAME, activeWorkspace.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionDays * 24 * 60 * 60,
    });
  }

  // Log audit and security event
  await prisma.securityEvent.create({
    data: {
      adminId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: email,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
      metadataJson: JSON.stringify({
        role: adminRole,
        rememberMe: Boolean(rememberMe),
      }),
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: activeWorkspace?.id,
      userId: user.id,
      action: 'ADMIN_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
      metadataJson: JSON.stringify({ role: adminRole, email: user.email }),
    },
  });

  return {
    success: true,
    status: 200,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: adminRole,
      status: user.status,
      avatarUrl: user.avatarUrl,
      isSuperAdmin: user.isSuperAdmin || adminRole === 'SUPER_ADMIN',
    },
    workspace: activeWorkspace
      ? {
          id: activeWorkspace.id,
          name: activeWorkspace.name,
          slug: activeWorkspace.slug,
        }
      : null,
  };
}

/**
 * Verifies the current admin session from DB Session table.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const dbSession = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          memberships: {
            include: { workspace: true },
          },
        },
      },
    },
  });

  if (!dbSession || new Date(dbSession.expiresAt) < new Date()) {
    if (dbSession) {
      await prisma.session.delete({ where: { id: dbSession.id } }).catch(() => {});
    }
    return null;
  }

  const user = dbSession.user;
  if (user.status !== 'ACTIVE') return null;

  const activeWorkspace = user.memberships[0]?.workspace || null;
  const adminRole = user.role || (user.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN');

  return {
    session: dbSession,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: adminRole,
      status: user.status,
      avatarUrl: user.avatarUrl,
      isSuperAdmin: user.isSuperAdmin || adminRole === 'SUPER_ADMIN',
    },
    workspace: activeWorkspace
      ? {
          id: activeWorkspace.id,
          name: activeWorkspace.name,
          slug: activeWorkspace.slug,
        }
      : null,
  };
}

/**
 * Destroys current admin session.
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });

    if (session) {
      await prisma.securityEvent.create({
        data: {
          adminId: session.userId,
          action: 'LOGOUT',
          result: 'SUCCESS',
        },
      }).catch(() => {});

      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(WORKSPACE_COOKIE_NAME);
  }
}
