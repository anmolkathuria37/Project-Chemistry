import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SECTIONS = new Set(['date-planner', 'experiencex', 'get-date-ready']);

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const user = await currentUser();
  const email = user?.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress.toLowerCase();
  if (!email || !allowed.includes(email)) return { error: NextResponse.json({ error: 'Admin access required.' }, { status: 403 }) };
  return { userId };
}

function validText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

export async function GET(request: Request) {
  const access = await requireAdmin();
  if ('error' in access) return access.error;
  const section = new URL(request.url).searchParams.get('section');
  if (section && !SECTIONS.has(section)) return NextResponse.json({ error: 'Invalid content section.' }, { status: 400 });
  try {
    const items = await prisma.cmsContent.findMany({
      where: section ? { section } : undefined,
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Admin CMS list failed:', error);
    return NextResponse.json({ error: 'Could not load content. Ensure the CMS database migration has been applied.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const access = await requireAdmin();
  if ('error' in access) return access.error;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    const item = body as Record<string, unknown>;
    if (typeof item.section !== 'string' || !SECTIONS.has(item.section)) return NextResponse.json({ error: 'Choose a valid section.' }, { status: 400 });
    if (!validText(item.title, 191) || !validText(item.description, 10000)) return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    const slug = typeof item.slug === 'string' && item.slug.trim()
      ? item.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 191)
      : item.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 191);
    if (!slug) return NextResponse.json({ error: 'A valid title or slug is required.' }, { status: 400 });
    const optional = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const created = await prisma.cmsContent.create({
      data: {
        section: item.section, slug, title: item.title.trim(), description: item.description.trim(),
        category: optional(item.category, 120), neighborhood: optional(item.neighborhood, 191),
        budgetLabel: optional(item.budgetLabel, 120), imageUrl: optional(item.imageUrl, 1000),
        published: item.published === true,
        sortOrder: typeof item.sortOrder === 'number' && Number.isInteger(item.sortOrder) ? Math.max(0, Math.min(item.sortOrder, 100000)) : 0,
      },
    });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'That slug already exists in this section.' }, { status: 409 });
    console.error('Admin CMS create failed:', error);
    return NextResponse.json({ error: 'Could not create content.' }, { status: 500 });
  }
}