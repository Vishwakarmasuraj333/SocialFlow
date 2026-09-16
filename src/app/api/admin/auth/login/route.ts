import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { signSessionToken, SESSION_COOKIE_NAME, WORKSPACE_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@socialflow.io').toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Find admin user
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });

    // If user does not exist but credentials match .env Admin, provision superadmin
    if (!user && cleanEmail === envAdminEmail && envAdminPassword && password === envAdminPassword) {
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
      const newHash = await bcrypt.hash(envAdminPassword, 10);
      user = await prisma.user.create({
        data: {
          email: envAdminEmail,
          name: process.env.ADMIN_NAME || 'Super Administrator',
          passwordHash: newHash,
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
        include: {
          memberships: {
            include: { workspace: true },
          },
        },
      });
    }

    if (!user) {
      await prisma.securityEvent.create({
        data: {
          action: 'LOGIN_FAILED',
          resource: cleanEmail,
          ipAddress,
          userAgent,
          result: 'FAILED',
          metadataJson: JSON.stringify({ reason: 'User not found', email: cleanEmail }),
        },
      });

      return NextResponse.json(
        { error: 'Invalid administrative credentials' },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      await prisma.securityEvent.create({
        data: {
          adminId: user.id,
          action: 'LOGIN_BLOCKED',
          resource: cleanEmail,
          ipAddress,
          userAgent,
          result: 'BLOCKED',
          metadataJson: JSON.stringify({ reason: `Account is ${user.status}`, status: user.status }),
        },
      });

      return NextResponse.json(
        { error: `Your administrator account is ${user.status.toLowerCase()}. Contact a Super Admin.` },
        { status: 403 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesRemaining = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Account temporarily locked due to multiple failed attempts. Try again in ${minutesRemaining} minutes.`,
        },
        { status: 429 }
      );
    }

    // Verify password: check bcrypt hash, or check against env ADMIN_PASSWORD
    let isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid && envAdminPassword && password === envAdminPassword && (user.isSuperAdmin || cleanEmail === envAdminEmail)) {
      const newHash = await bcrypt.hash(envAdminPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = failedAttempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

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
          resource: cleanEmail,
          ipAddress,
          userAgent,
          result: 'FAILED',
          metadataJson: JSON.stringify({
            reason: 'Invalid password',
            failedAttempts,
            locked: shouldLock,
          }),
        },
      });

      return NextResponse.json(
        {
          error: shouldLock
            ? 'Too many failed login attempts. Account locked for 15 minutes.'
            : 'Invalid administrative credentials.',
        },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts and record metadata
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

    // Create session token
    const expiresIn = rememberMe ? '30d' : '7d';
    const sessionToken = await signSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin || adminRole === 'SUPER_ADMIN',
        workspaceId: activeWorkspace?.id,
        role: adminRole,
      },
      expiresIn
    );

    // Persist Session in DB
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
        userAgent,
        ipAddress,
      },
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60,
    });

    if (activeWorkspace) {
      cookieStore.set(WORKSPACE_COOKIE_NAME, activeWorkspace.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60,
      });
    }

    // Log Security & Audit Event
    await prisma.securityEvent.create({
      data: {
        adminId: user.id,
        action: 'LOGIN_SUCCESS',
        resource: cleanEmail,
        ipAddress,
        userAgent,
        result: 'SUCCESS',
        metadataJson: JSON.stringify({
          role: adminRole,
          workspaceId: activeWorkspace?.id,
          rememberMe: Boolean(rememberMe),
        }),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: activeWorkspace?.id,
        userId: user.id,
        action: 'ADMIN_LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
        metadataJson: JSON.stringify({ role: adminRole, email: user.email }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
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
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
