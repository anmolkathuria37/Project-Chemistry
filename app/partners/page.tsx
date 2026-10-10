'use client';

import Link from 'next/link';
import { Heart, ArrowRight, TrendingUp, Target, BarChart3, Zap, Shield, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-warm-gradient">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-burgundy-gradient flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Chemistry</span>
          </Link>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Store className="w-3.5 h-3.5" />
            For Businesses
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground text-balance">
            Turn dates into revenue.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Partner with Chemistry to reach couples actively planning their next date. Create offers, run campaigns, and measure what works — all in one platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-full bg-burgundy-gradient hover:opacity-90 h-12 px-8">
              Apply to Partner <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card/50 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Targeted Reach', desc: 'Connect with couples planning dates in your neighborhood. Filter by location, budget, and interests.' },
              { icon: TrendingUp, title: 'Campaign Analytics', desc: 'Track clicks, redemptions, and conversions. See exactly how your offers perform.' },
              { icon: Zap, title: 'Quick Setup', desc: 'Create your business profile, list offers, and start reaching daters in minutes.' },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">Who can partner?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Restaurants & Cafés',
              'Cinema Chains',
              'Fashion Brands',
              'Event Organizers',
              'Activity Venues',
              'Beauty & Grooming',
              'Gift Brands',
              'Lifestyle Providers',
            ].map((cat) => (
              <div key={cat} className="bg-card rounded-2xl p-5 border border-border/50 text-center">
                <p className="font-medium text-foreground">{cat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-burgundy-gradient text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Measure every rupee</h2>
          <p className="text-white/80 text-lg mb-8">
            Our analytics dashboard shows you exactly how your campaigns perform — from impressions to in-store visits.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="font-display text-3xl font-bold">Real-time</p>
              <p className="text-white/60 text-sm mt-1">Analytics</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold">Attribution</p>
              <p className="text-white/60 text-sm mt-1">Tracking</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold">ROI</p>
              <p className="text-white/60 text-sm mt-1">Reporting</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Privacy comes first</h2>
          <p className="text-muted-foreground">
            We never share private conversations, personal dating activity, or sensitive profile data with partners. All targeting uses aggregated, consented data only.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to grow with us?</h2>
          <p className="text-muted-foreground mb-8">Partner applications open now for Delhi NCR businesses.</p>
          <Button size="lg" className="rounded-full bg-burgundy-gradient hover:opacity-90 h-12 px-8">
            Apply to Become a Partner
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/50 bg-card/30 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">© 2026 Project Chemistry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
