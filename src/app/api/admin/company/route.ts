import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: Retrieve company profile
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const workspaceId = auth.workspace?.id;
    if (!workspaceId) {
      const firstWorkspace = await prisma.workspace.findFirst({
        include: { locations: true, _count: { select: { websites: true, socialAccounts: true, members: true } } },
      });
      return NextResponse.json({ company: firstWorkspace });
    }

    const company = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        locations: { where: { isArchived: false } },
        _count: {
          select: {
            websites: true,
            socialAccounts: true,
            members: true,
            posts: true,
            infrastructureAssets: true,
          },
        },
      },
    });

    return NextResponse.json({ company });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch company profile' }, { status: 500 });
  }
}

// PATCH: Update company profile
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const workspaceId = auth.workspace?.id;
    if (!workspaceId) {
      return NextResponse.json({ error: 'Active company workspace not specified' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      logoUrl,
      description,
      industry,
      website,
      businessEmail,
      businessPhone,
      country,
      state,
      city,
      businessAddress,
      postalCode,
      timezone,
      currency,
      taxId,
      socialLinksJson,
    } = body;

    const updatedCompany = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(industry !== undefined ? { industry } : {}),
        ...(website !== undefined ? { website } : {}),
        ...(businessEmail !== undefined ? { businessEmail } : {}),
        ...(businessPhone !== undefined ? { businessPhone } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(state !== undefined ? { state } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(businessAddress !== undefined ? { businessAddress } : {}),
        ...(postalCode !== undefined ? { postalCode } : {}),
        ...(timezone ? { timezone } : {}),
        ...(currency ? { currency } : {}),
        ...(taxId !== undefined ? { taxId } : {}),
        ...(socialLinksJson !== undefined ? { socialLinksJson: typeof socialLinksJson === 'string' ? socialLinksJson : JSON.stringify(socialLinksJson) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId: auth.user.id,
        action: 'COMPANY_PROFILE_UPDATED',
        entityType: 'Company',
        entityId: workspaceId,
        metadataJson: JSON.stringify({ name: updatedCompany.name, updatedBy: auth.user.email }),
      },
    });

    return NextResponse.json({ success: true, company: updatedCompany });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update company' }, { status: 500 });
  }
}
