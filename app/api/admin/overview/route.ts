import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin(email?: string | null) {
  const configured = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && configured.includes(email.trim().toLowerCase()));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!(await isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const [users, completedProfiles, matches, messages, pendingReports, savedDatePlans] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { onboardingCompleted: true } }),
        prisma.match.count(),
        prisma.message.count(),
        prisma.report.count({ where: { status: 'pending' } }),
        prisma.savedDatePlan.count(),
      ]);

    return NextResponse.json({
      metrics: {
        users,
        completedProfiles,
        incompleteProfiles: Math.max(0, users - completedProfiles),
        matches,
        messages,
        pendingReports,
        savedDatePlans,
      },
      revenue: {
        available: false,
        amount: null,
        currency: 'INR',
        reason: 'Revenue is not available until a payment provider and transaction ledger are integrated.',
      },
      integrations: {
        paymentProvider: 'not_configured',
        imageStorage: 'local_uploads_not_configured',
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Admin overview failed:', error);
    return NextResponse.json({ error: 'Could not load admin metrics.' }, { status: 500 });
  }
}
