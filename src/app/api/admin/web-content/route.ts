import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List web pages and blog posts
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get('websiteId');
    const type = searchParams.get('type');

    const where: any = {};
    if (websiteId) where.websiteId = websiteId;
    if (type) where.type = type.toUpperCase();

    const contents = await prisma.webContent.findMany({
      where,
      include: {
        website: { select: { id: true, name: true, domain: true } },
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ contents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content' }, { status: 500 });
  }
}

// POST: Create page or blog post
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      websiteId,
      type = 'BLOG_POST',
      title,
      slug,
      content,
      excerpt,
      status = 'DRAFT',
      scheduledAt,
      publishedAt,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogImageUrl,
      tagsJson,
      categoriesJson,
    } = body;

    if (!websiteId || !title || !content) {
      return NextResponse.json(
        { error: 'Website ID, Title, and Content are required' },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const createdContent = await prisma.webContent.create({
      data: {
        websiteId,
        authorId: auth.user.id,
        type: type.toUpperCase(),
        title: title.trim(),
        slug: cleanSlug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : (publishedAt ? new Date(publishedAt) : null),
        metaTitle: metaTitle?.trim() || title.trim(),
        metaDescription: metaDescription?.trim() || excerpt?.trim() || null,
        canonicalUrl: canonicalUrl?.trim() || null,
        ogImageUrl: ogImageUrl?.trim() || null,
        tagsJson: typeof tagsJson === 'string' ? tagsJson : JSON.stringify(tagsJson || []),
        categoriesJson: typeof categoriesJson === 'string' ? categoriesJson : JSON.stringify(categoriesJson || []),
      },
      include: { website: true },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: createdContent.website.workspaceId,
        userId: auth.user.id,
        action: 'WEB_CONTENT_CREATED',
        entityType: 'WebContent',
        entityId: createdContent.id,
        metadataJson: JSON.stringify({ title: createdContent.title, slug: createdContent.slug }),
      },
    });

    return NextResponse.json({ success: true, content: createdContent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create content' }, { status: 500 });
  }
}

// PATCH: Update page or blog post
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const updated = await prisma.webContent.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.status === 'PUBLISHED' && !updateData.publishedAt ? { publishedAt: new Date() } : {}),
      },
      include: { website: true },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: updated.website.workspaceId,
        userId: auth.user.id,
        action: 'WEB_CONTENT_UPDATED',
        entityType: 'WebContent',
        entityId: updated.id,
        metadataJson: JSON.stringify({ title: updated.title, status: updated.status }),
      },
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update content' }, { status: 500 });
  }
}

// DELETE: Remove web content
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const content = await prisma.webContent.findUnique({
      where: { id },
      include: { website: true },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await prisma.webContent.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        workspaceId: content.website.workspaceId,
        userId: auth.user.id,
        action: 'WEB_CONTENT_DELETED',
        entityType: 'WebContent',
        entityId: id,
        metadataJson: JSON.stringify({ title: content.title }),
      },
    });

    return NextResponse.json({ success: true, message: 'Content permanently deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete content' }, { status: 500 });
  }
}
