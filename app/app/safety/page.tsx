'use client';

import Link from 'next/link';
import { Shield, AlertTriangle, Ban, Flag, Phone, MapPin, Heart, Eye, Lock, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SafetyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Safety Center</h1>
        <p className="text-muted-foreground mt-2">Your safety is our top priority. Here's how we protect you and what you can do.</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/app/messages" className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-card transition-all">
          <Ban className="w-6 h-6 text-primary mb-2" />
          <h3 className="font-semibold text-foreground">Block or Report</h3>
          <p className="text-sm text-muted-foreground mt-1">Block users or report inappropriate behavior from any conversation.</p>
        </Link>
        <Link href="/app/settings" className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-card transition-all">
          <Lock className="w-6 h-6 text-primary mb-2" />
          <h3 className="font-semibold text-foreground">Privacy Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">Control who can see your profile and manage your discovery preferences.</p>
        </Link>
      </div>

      {/* Safety tips */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Safe Dating Tips</h2>
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Meet in public places', desc: 'Always choose a public, well-lit location for your first few dates. Cafés, restaurants, and busy areas are great choices.' },
            { icon: Users, title: 'Tell a friend', desc: 'Let someone know where you\'re going, who you\'re meeting, and when you expect to be back.' },
            { icon: Eye, title: 'Trust your instincts', desc: 'If something feels off, it probably is. You can always end a conversation, unmatch, or leave a date early.' },
            { icon: Heart, title: 'Take your time', desc: 'Don\'t feel pressured to move fast. Get to know the person through messages before meeting in person.' },
            { icon: Phone, title: 'Keep your number private', desc: 'Use Chemistry\'s in-app messaging until you feel comfortable sharing personal contact details.' },
          ].map((tip) => (
            <div key={tip.title} className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">{tip.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community guidelines */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Community Guidelines</h2>
        <div className="space-y-3">
          {[
            'Be authentic. Use real photos and honest information about yourself.',
            'Respect others. No harassment, hate speech, or abusive behavior.',
            'No spam or solicitation. Don\'t use Chemistry to sell products or services.',
            'Adults only. You must be 18 or older to use this platform.',
            'Report violations. Help us keep the community safe by reporting inappropriate behavior.',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-semibold">{i + 1}</span>
              </div>
              <p className="text-sm text-foreground/80">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency resources */}
      <div className="bg-destructive/5 rounded-3xl border border-destructive/20 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="font-display text-xl font-bold text-foreground">Emergency Resources</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          If you feel unsafe or are in immediate danger, contact local emergency services. In India, dial 112 for emergencies.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border/50">
            <span className="text-sm text-foreground">Emergency Helpline (India)</span>
            <span className="text-sm font-semibold text-destructive">112</span>
          </div>
          <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border/50">
            <span className="text-sm text-foreground">Women's Helpline</span>
            <span className="text-sm font-semibold text-destructive">1091</span>
          </div>
          <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border/50">
            <span className="text-sm text-foreground">Cyber Crime Helpline</span>
            <span className="text-sm font-semibold text-destructive">1930</span>
          </div>
        </div>
      </div>

      {/* Privacy commitment */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Our Privacy Commitment</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          We never share your private messages, exact location, or sensitive profile data with other users or partners. All data is encrypted in transit and at rest. You can request a copy of your data or delete your account at any time.
        </p>
      </div>
    </div>
  );
}
