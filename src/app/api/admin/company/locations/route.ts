import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List locations
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = auth.workspace?.id;
    const locations = await prisma.businessLocation.findMany({
      where: {
        isArchived: false,
        ...(workspaceId ? { workspaceId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch locations' }, { status: 500 });
  }
}

// POST: Create location
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = auth.workspace?.id;
    if (!workspaceId) {
      return NextResponse.json({ error: 'Company workspace not selected' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      type = 'OFFICE',
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      timezone = 'UTC',
      status = 'ACTIVE',
    } = body;

    if (!name || !address || !city || !country) {
      return NextResponse.json(
        { error: 'Name, Address, City, and Country are required' },
        { status: 400 }
      );
    }

    const location = await prisma.businessLocation.create({
      data: {
        workspaceId,
        name: name.trim(),
        type,
        address: address.trim(),
        city: city.trim(),
        state: state?.trim() || null,
        country: country.trim(),
        postalCode: postalCode?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        timezone,
        status,
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId: auth.user.id,
        action: 'LOCATION_CREATED',
        entityType: 'BusinessLocation',
        entityId: location.id,
        metadataJson: JSON.stringify({ name: location.name, type: location.type, city: location.city }),
      },
    });

    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create location' }, { status: 500 });
  }
}

// PATCH: Update location
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const location = await prisma.businessLocation.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: location.workspaceId,
        userId: auth.user.id,
        action: 'LOCATION_UPDATED',
        entityType: 'BusinessLocation',
        entityId: location.id,
        metadataJson: JSON.stringify({ name: location.name }),
      },
    });

    return NextResponse.json({ success: true, location });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update location' }, { status: 500 });
  }
}

// DELETE: Archive or permanently delete location
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const location = await prisma.businessLocation.findUnique({ where: { id } });
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    if (permanent) {
      await prisma.businessLocation.delete({ where: { id } });
    } else {
      await prisma.businessLocation.update({
        where: { id },
        data: { isArchived: true, status: 'ARCHIVED' },
      });
    }

    await prisma.auditLog.create({
      data: {
        workspaceId: location.workspaceId,
        userId: auth.user.id,
        action: permanent ? 'LOCATION_PERMANENTLY_DELETED' : 'LOCATION_ARCHIVED',
        entityType: 'BusinessLocation',
        entityId: id,
        metadataJson: JSON.stringify({ name: location.name, permanent }),
      },
    });

    return NextResponse.json({
      success: true,
      message: permanent ? 'Location permanently purged' : 'Location moved to archive',
      permanent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete location' }, { status: 500 });
  }
}
