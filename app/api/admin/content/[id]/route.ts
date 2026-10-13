import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return false;
  const email = session.user.email?.trim().toLowerCase();
  return Boolean(email && allowed.includes(email));
}

const sections = new Set(['date-planner', 'experiencex', 'get-date-ready']);

export async function PATCH(request: Request, context: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    const input = body as Record<string, unknown>;
    const data: Prisma.CmsContentUpdateInput = {};
    if (input.section !== undefined) {
      if (typeof input.section !== 'string' || !sections.has(input.section)) return NextResponse.json({ error: 'Invalid section.' }, { status: 400 });
      data.section = input.section;
    }
    for (const key of ['title', 'description'] as const) {
      const value = input[key];
      if (value !== undefined) {
        if (typeof value !== 'string' || !value.trim() || value.length > (key === 'title' ? 191 : 10000)) return NextResponse.json({ error: key + ' is invalid.' }, { status: 400 });
        data[key] = value.trim();
      }
    }
    if (input.slug !== undefined) {
      if (typeof input.slug !== 'string' || !input.slug.trim()) return NextResponse.json({ error: 'Slug is invalid.' }, { status: 400 });
      data.slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 191);
    }
    for (const [inputKey, dbKey, max] of [['category', 'category', 120], ['neighborhood', 'neighborhood', 191], ['budgetLabel', 'budgetLabel', 120], ['imageUrl', 'imageUrl', 1000]] as const) {
      const value = input[inputKey];
      if (value !== undefined) {
        if (typeof value !== 'string') return NextResponse.json({ error: inputKey + ' must be text.' }, { status: 400 });
        data[dbKey] = value.trim().slice(0, max);
      }
    }
    if (input.published !== undefined) {
      if (typeof input.published !== 'boolean') return NextResponse.json({ error: 'Published must be true or false.' }, { status: 400 });
      data.published = input.published;
    }
    if (input.sortOrder !== undefined) {
      if (typeof input.sortOrder !== 'number' || !Number.isInteger(input.sortOrder)) return NextResponse.json({ error: 'Sort order must be a whole number.' }, { status: 400 });
      data.sortOrder = Math.max(0, Math.min(input.sortOrder, 100000));
    }
    const item = await prisma.cmsContent.update({ where: { id: context.params.id }, data });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
      if (error.code === 'P2002') return NextResponse.json({ error: 'That slug already exists in this section.' }, { status: 409 });
    }
    console.error('Admin CMS update failed:', error);
    return NextResponse.json({ error: 'Could not update content.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    await prisma.cmsContent.delete({ where: { id: context.params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
    console.error('Admin CMS delete failed:', error);
    return NextResponse.json({ error: 'Could not delete content.' }, { status: 500 });
  }
}