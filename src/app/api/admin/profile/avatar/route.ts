import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthContext, signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/db';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || (!auth.user.isSuperAdmin && auth.user.role !== 'SUPER_ADMIN' && auth.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('avatar') || formData.get('image')) as File | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a real JPG, JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.` },
        { status: 400 }
      );
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `admin-${auth.user.id.slice(-8)}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let avatarUrl: string;

    // Upload directly to Cloudinary for permanent, high-speed CDN delivery
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadBufferToCloudinary(buffer, {
          filename,
          folder: 'avatars',
          mimeType: file.type,
          tags: ['admin', 'avatar', auth.user.id],
        });
        avatarUrl = uploadResult.secure_url;
      } catch (cloudErr: any) {
        console.error('Cloudinary upload error, falling back to base64:', cloudErr);
        const base64Data = buffer.toString('base64');
        avatarUrl = `data:${file.type};base64,${base64Data}`;
      }
    } else {
      // Fallback Data URI if Cloudinary keys not in environment
      const base64Data = buffer.toString('base64');
      avatarUrl = `data:${file.type};base64,${base64Data}`;
    }

    // Persist real avatarUrl in Prisma database
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        isSuperAdmin: true,
      },
    });

    // Re-sign session cookie so header and layout reflect the new avatar immediately
    const sessionToken = await signSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isSuperAdmin: updatedUser.isSuperAdmin,
      workspaceId: auth.workspace?.id,
      role: auth.workspace?.role,
    });

    // Log security and audit events
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: 'ADMIN_AVATAR_UPLOADED',
        entityType: 'User',
        entityId: auth.user.id,
        metadataJson: JSON.stringify({ filename, sizeBytes: file.size, mimeType: file.type }),
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Unknown',
      },
    });

    await prisma.securityEvent.create({
      data: {
        adminId: auth.user.id,
        action: 'PROFILE_PHOTO_UPDATED',
        resource: avatarUrl,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Unknown',
        result: 'SUCCESS',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      avatarUrl: updatedUser.avatarUrl,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process and upload profile image' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || (!auth.user.isSuperAdmin && auth.user.role !== 'SUPER_ADMIN' && auth.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { avatarUrl: true },
    });

    // Reset avatarUrl to null in DB
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: { avatarUrl: null },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        isSuperAdmin: true,
      },
    });

    // Re-sign session cookie
    const sessionToken = await signSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isSuperAdmin: updatedUser.isSuperAdmin,
      workspaceId: auth.workspace?.id,
      role: auth.workspace?.role,
    });

    // Log events
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: 'ADMIN_AVATAR_REMOVED',
        entityType: 'User',
        entityId: auth.user.id,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Unknown',
      },
    });

    await prisma.securityEvent.create({
      data: {
        adminId: auth.user.id,
        action: 'PROFILE_PHOTO_REMOVED',
        resource: 'avatarUrl',
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Unknown',
        result: 'SUCCESS',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Profile photo removed. Account is now using clean generated initials.',
      avatarUrl: null,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to remove profile photo' },
      { status: 500 }
    );
  }
}
