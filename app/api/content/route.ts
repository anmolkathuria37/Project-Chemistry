import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SECTIONS = new Set(['date-planner', 'experiencex', 'get-date-ready']);

export async function GET(request: Request) {
  const section = new URL(request.url).searchParams.get('section');
  if (!section || !SECTIONS.has(section)) return NextResponse.json({ error: 'A valid section is required.' }, { status: 400 });
  try {
    const items = await prisma.cmsContent.findMany({
      where: { section, published: true },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      select: { id: true, section: true, slug: true, title: true, description: true, category: true, neighborhood: true, budgetLabel: true, imageUrl: true, sortOrder: true },
    });
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Public CMS read failed:', error);
    return NextResponse.json({ error: 'Content is temporarily unavailable.' }, { status: 500 });
  }
}