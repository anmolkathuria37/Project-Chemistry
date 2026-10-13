'use client';

import Image from 'next/image';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Calendar, MapPin, Coffee, Film, Shirt, Music, Shield, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  const { user, profile, loading } = useAuth();

  const getPrimaryCTA = () => {
    if (loading) return { href: '#', label: 'Loading...' };
    if (user && profile?.onboarding_completed) return { href: '/app/discover', label: 'Open Discover' };
    if (user) return { href: '/onboarding', label: 'Complete Your Profile' };
    return { href: '/signup', label: 'Find Your Kind of Connection' };
  };

  const cta = getPrimaryCTA();

  return (
    <div className="min-h-screen bg-warm-gradient">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-burgundy-gradient flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Chemistry</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
            <Link href="/#experiences" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Experiences</Link>
            <Link href="/#safety" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Safety</Link>
            <Link href="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partner with us</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="rounded-full">
                <Link href={profile?.onboarding_completed ? '/app/discover' : '/onboarding'}>
                  {profile?.onboarding_completed ? 'Open App' : 'Continue Setup'}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full bg-burgundy-gradient">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Now launching in Delhi NCR
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] text-balance">
                Dating should lead <span className="text-primary italic">somewhere.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Meet people who get you. Discover experiences you&apos;ll love. Turn a match into a real-world memory.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full text-base h-12 px-8 bg-burgundy-gradient hover:opacity-90">
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full text-base h-12 px-8 border-border bg-background/50">
                  <Link href="/app/experiences">Explore Date Experiences</Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  18+ verified
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Meaningful matches
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Real-world dates
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-card aspect-[3/4]">
                    <Image width={1200} height={800} unoptimized src="https://images.pexels.com/photos/9608431/pexels-photo-9608431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Couple at dinner" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-card aspect-[4/3]">
                    <Image width={1200} height={800} unoptimized src="https://images.pexels.com/photos/2513611/pexels-photo-2513611.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Live music event" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-card aspect-[4/3]">
                    <Image width={1200} height={800} unoptimized src="https://images.pexels.com/photos/4255394/pexels-photo-4255394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Couple at cafe" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-card aspect-[3/4]">
                    <Image width={1200} height={800} unoptimized src="https://images.pexels.com/photos/36534064/pexels-photo-36534064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Fashion inspiration" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-card p-4 border border-border/50 animate-scale-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">82% Compatibility</p>
                    <p className="text-xs text-muted-foreground">Shared interests + values</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">The Journey</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-balance">
              From a match to a memory
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Every great relationship starts with a great date. We&apos;re built for the whole journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { icon: Heart, label: 'Discover', desc: 'Find compatible people' },
              { icon: Sparkles, label: 'Match', desc: 'When interest is mutual' },
              { icon: ArrowRight, label: 'Connect', desc: 'Start a conversation' },
              { icon: Calendar, label: 'Plan', desc: 'Build a date together' },
              { icon: Coffee, label: 'Experience', desc: 'Meet in real life' },
              { icon: Shirt, label: 'Get Ready', desc: 'Look your best' },
              { icon: Star, label: 'Connect More', desc: 'Grow closer' },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-background rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Step {i + 1}</p>
                  <h3 className="font-semibold text-foreground text-sm">{step.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                </div>
                {i < 6 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2.5 z-10">
                    <ArrowRight className="w-4 h-4 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovery preview */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">Intelligent Discovery</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-balance">
                Compatibility beyond a photo
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                We look at shared interests, relationship intentions, lifestyle preferences, and what you both love doing on weekends. Every recommendation comes with a reason.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Explainable compatibility scores with real reasons',
                  'Shared interests and lifestyle alignment',
                  'Relationship intention matching',
                  'Verified profile indicators for trust',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Heart className="w-3 h-3 text-primary" fill="currentColor" />
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 rounded-full" size="lg">
                <Link href="/signup">Start Discovering</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-border/50">
                <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
                  <div className="relative h-80">
                    <Image width={1200} height={800} unoptimized src="https://images.pexels.com/photos/5910783/pexels-photo-5910783.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-display text-2xl font-bold">Ananya, 26</p>
                      <p className="text-sm opacity-90">Designer · Hauz Khas</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">82% Match</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3" /> Verified
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Loves indie music, street photography, and weekend café hopping.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Live Music', 'Photography', 'Coffee', 'Travel'].map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences preview */}
      <section id="experiences" className="py-20 md:py-28 bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">Experiences</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-balance">
              Plan dates you&apos;ll actually want to go on
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Coffee, title: 'Café Dates', desc: 'Cozy corners and great coffee', img: 'https://images.pexels.com/photos/8836421/pexels-photo-8836421.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
              { icon: Film, title: 'Movies & More', desc: 'Cinema plus dinner packages', img: 'https://images.pexels.com/photos/5911173/pexels-photo-5911173.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
              { icon: Music, title: 'Live Events', desc: 'Concerts, comedy, and culture', img: 'https://images.pexels.com/photos/2513611/pexels-photo-2513611.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
              { icon: Shirt, title: 'Get Date Ready', desc: 'Outfit picks and styling', img: 'https://images.pexels.com/photos/36534064/pexels-photo-36534064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
            ].map((exp) => (
              <div key={exp.title} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden shadow-card aspect-[4/5] mb-4 relative">
                  <Image width={1200} height={800} unoptimized src={exp.img} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center">
                    <exp.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{exp.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety section */}
      <section id="safety" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Shield, title: '18+ Verified', desc: 'Age-gated and identity-checked' },
                    { icon: Heart, title: 'Consent-First', desc: 'You control who can reach you' },
                    { icon: Sparkles, title: 'Photo Moderation', desc: 'Every photo reviewed' },
                    { icon: MapPin, title: 'Safe Meeting Tips', desc: 'Public places, always' },
                  ].map((item) => (
                    <div key={item.title} className="bg-card rounded-xl p-4 border border-border/50">
                      <item.icon className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">Trust & Safety</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-balance">
                Safety is not a feature. It&apos;s the foundation.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Every profile is age-verified. Every photo is moderated. Every user controls their privacy. We provide tools to block, report, and stay safe — because trust is everything.
              </p>
              <Button asChild variant="outline" className="mt-8 rounded-full" size="lg">
                <Link href="/signup">Join Safely</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner section */}
      <section className="py-20 md:py-28 bg-burgundy-gradient text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-white/60 font-medium text-sm uppercase tracking-wider mb-3">For Businesses</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-balance">
                Partner with Chemistry
              </h2>
              <p className="mt-4 text-white/80 text-lg leading-relaxed">
                Restaurants, cafés, cinemas, fashion brands, and event organizers — reach couples planning their next date. Create offers, run campaigns, and measure what works.
              </p>
              <Button asChild className="mt-8 rounded-full bg-white text-primary hover:bg-white/90" size="lg">
                <Link href="/partners">Become a Partner</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '50K+', label: 'Active daters' },
                { stat: '12K+', label: 'Dates planned' },
                { stat: '200+', label: 'Partner venues' },
                { stat: '4.8★', label: 'User rating' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <p className="font-display text-3xl font-bold">{s.stat}</p>
                  <p className="text-white/70 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground text-balance">
            Your next great date starts here.
          </h2>
          <p className="mt-6 text-muted-foreground text-lg">
            Join Chemistry today. Meet someone who gets you, plan a date you&apos;ll both love, and see where it goes.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full text-base h-14 px-10 bg-burgundy-gradient hover:opacity-90">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-burgundy-gradient flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
                <span className="font-display text-lg font-bold text-foreground">Chemistry</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">Dating that leads somewhere. Connecting people through meaningful experiences.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
                <li><Link href="/app/experiences" className="hover:text-foreground transition-colors">Experiences</Link></li>
                <li><Link href="/app/discover" className="hover:text-foreground transition-colors">Discover</Link></li>
                <li><Link href="/partners" className="hover:text-foreground transition-colors">Partner with us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">Safety</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/app/safety" className="hover:text-foreground transition-colors">Safety Center</Link></li>
                <li><Link href="/app/safety" className="hover:text-foreground transition-colors">Community Guidelines</Link></li>
                <li><Link href="/app/safety" className="hover:text-foreground transition-colors">Report a Concern</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 Project Chemistry. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Made with care in Delhi NCR · For adults 18+</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
