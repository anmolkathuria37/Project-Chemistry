'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, AlertTriangle, CalendarHeart, CheckCircle2, CircleDollarSign, HeartHandshake, Loader2, PlugZap, RefreshCw, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Overview = {
  metrics: {
    users: number;
    completedProfiles: number;
    incompleteProfiles: number;
    matches: number;
    messages: number;
    pendingReports: number;
    savedDatePlans: number;
  };
  revenue: { available: boolean; amount: number | null; currency: string; reason: string };
  integrations: { paymentProvider: string; imageStorage: string };
};

const metricCards = [
  { key: 'users', label: 'Total members', icon: Users, description: 'Registered profiles' },
  { key: 'completedProfiles', label: 'Onboarded', icon: CheckCircle2, description: 'Profiles ready to discover' },
  { key: 'incompleteProfiles', label: 'Onboarding drop-off', icon: Activity, description: 'Profiles still in progress' },
  { key: 'matches', label: 'Matches', icon: HeartHandshake, description: 'Mutual connections created' },
  { key: 'messages', label: 'Messages', icon: MessageCircle, description: 'Messages sent' },
  { key: 'pendingReports', label: 'Safety queue', icon: AlertTriangle, description: 'Reports awaiting review' },
  { key: 'savedDatePlans', label: 'Saved date plans', icon: CalendarHeart, description: 'Plans saved by members' },
] as const;

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/overview', { cache: 'no-store' });
      const result = await response.json();
      if (response.status === 401) {
        router.replace('/login');
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Admin access could not be verified.');
      setData(result as Overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void loadOverview(); }, [loadOverview]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Chemistry · Operations</p>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Control centre</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A private overview of product health, member activity and operational queues.</p>
          </div>
          <Button variant="outline" onClick={() => void loadOverview()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh metrics
          </Button>
        </header>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold">Dashboard unavailable</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
            {error.toLowerCase().includes('admin') && <p className="mt-2">Add the email you sign in with to ADMIN_EMAILS in .env.local, then restart the dev server.</p>}
          </div>
        )}

        {loading && !data ? (
          <div className="flex min-h-64 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading secure metrics…</div>
        ) : data ? (
          <>
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Product metrics">
              {metricCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{card.label}</span>
                      <span className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></span>
                    </div>
                    <p className="mt-5 text-3xl font-semibold tabular-nums">{data.metrics[card.key].toLocaleString('en-IN')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                  </article>
                );
              })}
            </section>

            <section className="mt-7 grid gap-5 lg:grid-cols-2">
              <article className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3"><CircleDollarSign className="h-5 w-5 text-primary" /><h2 className="font-semibold">Revenue & payments</h2></div>
                <p className="mt-4 text-2xl font-semibold">{data.revenue.available && data.revenue.amount !== null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: data.revenue.currency }).format(data.revenue.amount) : 'Not connected'}</p>
                <p className="mt-2 text-sm text-muted-foreground">{data.revenue.reason}</p>
                <p className="mt-4 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">No revenue is fabricated. Choose a payment provider and record verified transactions before financial reporting is enabled.</p>
              </article>
              <article className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3"><PlugZap className="h-5 w-5 text-primary" /><h2 className="font-semibold">Integration readiness</h2></div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><span>Payment provider</span><span className="rounded-full bg-muted px-3 py-1 text-xs">{data.integrations.paymentProvider.replaceAll('_', ' ')}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Image storage</span><span className="rounded-full bg-muted px-3 py-1 text-xs">{data.integrations.imageStorage.replaceAll('_', ' ')}</span></div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Provider credentials must stay in server-side environment variables or a dedicated secrets manager—not in browser code or ordinary CMS records.</p>
              </article>
            </section>

            <section className="mt-7 rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-semibold">Content management</h2><a href="/admin/content" className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">Open CMS →</a></div>
              <p className="mt-2 text-sm text-muted-foreground">Create and publish content for Date Planner, Experiencex and Get Date Ready from one admin workspace. Media storage, provider integrations, audit logs and transaction-level revenue will follow as separate modules.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {['Page content CMS', 'Media library', 'Discover settings', 'Integration health', 'Audit log', 'Payments ledger'].map((label) => <span key={label} className="rounded-full border border-border px-3 py-1.5">{label}</span>)}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
