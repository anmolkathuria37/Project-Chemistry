'use client';

import Image from 'next/image';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Coffee, Utensils, Film, Music, MapPin, DollarSign, Sparkles, Heart, ArrowRight, Clock, BookmarkCheck, ClipboardCopy, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type DateCategory = {
  key: string;
  label: string;
  icon: typeof Coffee;
  desc: string;
};

type DateIdea = {
  id: string;
  title: string;
  desc: string;
  neighborhood: string;
  budget: string;
  image: string;
  categoryKey?: string;
};

type CmsContentItem = { id: string; title: string; description: string; category: string; neighborhood: string; budgetLabel: string; imageUrl: string; };

type SavedDatePlan = {
  id: string;
  category: string;
  title: string;
  description: string;
  neighborhood: string;
  budget_label: string;
  preferred_date: string | null;
  image_url: string;
  created_at: string;
};

const DATE_CATEGORIES: DateCategory[] = [
  { key: 'coffee', label: 'Coffee Date', icon: Coffee, desc: 'Keep it simple and warm' },
  { key: 'dinner', label: 'Dinner', icon: Utensils, desc: 'Classic and romantic' },
  { key: 'movie', label: 'Movie + Food', icon: Film, desc: 'Dinner and a show' },
  { key: 'live', label: 'Live Music', icon: Music, desc: 'For music lovers' },
  { key: 'surprise', label: 'Surprise Date', icon: Sparkles, desc: 'Let fate decide' },
];

const DATE_IDEAS: Record<string, DateIdea[]> = {
  coffee: [
    { id: 'coffee-hauz-khas', title: 'Café Hopping in Hauz Khas', desc: 'Start with a relaxed coffee, then take a stroll and decide together whether to continue. An easy first-date plan with room for conversation.', neighborhood: 'Hauz Khas Village', budget: '₹500 - ₹1,000 per person', image: 'https://images.pexels.com/photos/8836421/pexels-photo-8836421.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { id: 'coffee-lota', title: 'A Calm Café Conversation', desc: 'A cozy café stop with regional food and a quieter atmosphere for getting to know each other.', neighborhood: 'Pragati Maidan', budget: '₹600 - ₹1,200 per person', image: 'https://images.pexels.com/photos/4255394/pexels-photo-4255394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  dinner: [
    { id: 'dinner-rooftop', title: 'Rooftop Dinner in Mehrauli', desc: 'Make an evening of it with a scenic setting and a relaxed dinner. Check current menus and reservation availability before visiting.', neighborhood: 'Mehrauli', budget: '₹2,000 - ₹3,500 per person', image: 'https://images.pexels.com/photos/5019013/pexels-photo-5019013.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { id: 'dinner-modern-indian', title: 'A Special Modern Indian Dinner', desc: 'A memorable food-focused date for a special occasion. Reservations and current prices should be confirmed with the venue.', neighborhood: 'Lodhi Road', budget: '₹3,000 - ₹5,000 per person', image: 'https://images.pexels.com/photos/9608431/pexels-photo-9608431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  movie: [
    { id: 'movie-food', title: 'Movie Night + Dinner', desc: 'Choose a movie you both want to see, then leave time afterward to talk over a meal. Check live showtimes before booking.', neighborhood: 'Choose a cinema near you', budget: '₹1,200 - ₹2,500 per person', image: 'https://images.pexels.com/photos/5911173/pexels-photo-5911173.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  live: [
    { id: 'live-music', title: 'Live Music and Good Food', desc: 'Discover a local gig or live-music venue, and make the music a shared experience. Confirm event schedules and entry requirements.', neighborhood: 'RK Puram', budget: '₹800 - ₹2,000 per person', image: 'https://images.pexels.com/photos/2513611/pexels-photo-2513611.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  surprise: [
    { id: 'art-coffee', title: 'Art Gallery + Coffee', desc: 'Explore an exhibition together, pick a favorite artwork, and continue the conversation at a nearby café.', neighborhood: 'India Gate area', budget: '₹300 - ₹800 per person', image: 'https://images.pexels.com/photos/1303753/pexels-photo-1303753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
};

function maximumBudget(idea: DateIdea) {
  const values = idea.budget.match(/[\d,]+/g);
  if (!values || values.length === 0) return Number.POSITIVE_INFINITY;
  return Number(values[values.length - 1].replace(/,/g, ''));
}

export default function PlannerPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('coffee');
  const [neighborhood, setNeighborhood] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [generated, setGenerated] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedDatePlan[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [cmsIdeas, setCmsIdeas] = useState<DateIdea[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/content?section=date-planner', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return [];
        const result = await response.json();
        return Array.isArray(result.items) ? result.items as CmsContentItem[] : [];
      })
      .then((items) => {
        if (!active) return;
        const mapped = items.map((item) => {
          const value = (item.category || '').trim().toLowerCase();
          const key = value.includes('coffee') || value.includes('cafe') || value.includes('café')
            ? 'coffee'
            : value.includes('dinner') || value.includes('food') || value.includes('restaurant')
              ? 'dinner'
              : value.includes('movie') || value.includes('film') || value.includes('cinema')
                ? 'movie'
                : value.includes('music') || value.includes('live') || value.includes('concert')
                  ? 'live'
                  : 'surprise';
          return {
            id: 'cms-' + item.id,
            title: item.title,
            desc: item.description,
            neighborhood: item.neighborhood || 'Explore your area',
            budget: item.budgetLabel || 'Budget not listed',
            image: item.imageUrl || (DATE_IDEAS[key]?.[0]?.image ?? DATE_IDEAS.coffee[0].image),
            categoryKey: key,
          };
        });
        setCmsIdeas(mapped);
      })
      .catch((error: unknown) => {
        // Keep the curated fallback usable, but do not hide a broken CMS connection.
        console.error('Date Planner CMS content failed to load:', error);
        if (active) toast.error('Some date ideas could not be loaded. Showing curated fallback ideas.');
      });
    return () => { active = false; };
  }, []);

  const loadSavedPlans = useCallback(async () => {
    if (!user) {
      setSavedPlans([]);
      return;
    }

    setSavedLoading(true);
    const { data, error } = await supabase
      .from('saved_date_plans')
      .select('id, category, title, description, neighborhood, budget_label, preferred_date, image_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Could not load your saved plans.');
    } else {
      setSavedPlans((data || []) as unknown as SavedDatePlan[]);
    }
    setSavedLoading(false);
  }, [user]);

  useEffect(() => {
    void loadSavedPlans();
  }, [loadSavedPlans]);

  const ideas = useMemo(() => {
    const query = neighborhood.trim().toLowerCase();
    const budgetLimit = budget.trim() ? Number(budget.replace(/[^\d]/g, '')) : null;

    const managedIdeas = cmsIdeas.filter((idea) => idea.categoryKey === category);
    return [...(DATE_IDEAS[category] || []), ...managedIdeas].filter((idea) => {
      const neighborhoodMatches = !query ||
        idea.neighborhood.toLowerCase().includes(query) ||
        idea.title.toLowerCase().includes(query) ||
        idea.desc.toLowerCase().includes(query);
      const budgetMatches = budgetLimit === null || !Number.isFinite(budgetLimit) ||
        maximumBudget(idea) <= budgetLimit;
      return neighborhoodMatches && budgetMatches;
    });
  }, [category, neighborhood, budget, cmsIdeas]);

  const saveIdea = async (idea: DateIdea) => {
    if (!user) {
      toast.error('Sign in to save date plans.');
      return;
    }

    const existing = savedPlans.find((plan) => plan.title === idea.title);
    setSavingId(idea.id);

    if (existing) {
      const { error } = await supabase.from('saved_date_plans').delete().eq('id', existing.id);
      if (error) {
        toast.error('Could not remove this saved plan.');
      } else {
        setSavedPlans((plans) => plans.filter((plan) => plan.id !== existing.id));
        toast.success('Plan removed from your saved ideas.');
      }
      setSavingId(null);
      return;
    }

    const { data, error } = await supabase
      .from('saved_date_plans')
      .insert({
        user_id: user.id,
        category,
        title: idea.title,
        description: idea.desc,
        neighborhood: idea.neighborhood,
        budget_label: idea.budget,
        preferred_date: date || null,
        image_url: idea.image,
      })
      .select('id, category, title, description, neighborhood, budget_label, preferred_date, image_url, created_at')
      .single();

    if (error) {
      toast.error(error.message.includes('saved_date_plans')
        ? 'Saved plans are not configured yet. Apply the latest Supabase migration and try again.'
        : 'Could not save this plan. Please try again.');
    } else if (data) {
      setSavedPlans((plans) => [data as unknown as SavedDatePlan, ...plans]);
      toast.success('Date idea saved to your collection.');
    }
    setSavingId(null);
  };

  const copyIdea = async (idea: DateIdea) => {
    const details = [
      idea.title,
      idea.desc,
      'Area: ' + idea.neighborhood,
      'Estimated budget: ' + idea.budget,
      date ? 'Preferred date: ' + date : '',
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(details);
      toast.success('Date idea copied. You can paste it into your match chat.');
    } catch {
      toast.error('Clipboard access is unavailable in this browser.');
    }
  };

  const savedIds = new Set(savedPlans.map((plan) => plan.title));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-7 h-7 text-primary" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">From match to meet-up</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Date Planner</h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">Find an idea that fits your vibe, budget and neighborhood. Save your favorites and share a plan with your match.</p>
      </div>

      <section className="mb-7">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">What kind of date?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {DATE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              aria-pressed={category === cat.key}
              onClick={() => { setCategory(cat.key); setGenerated(false); }}
              className={'p-4 rounded-2xl border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' + (category === cat.key
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/30')}
            >
              <cat.icon className={'w-6 h-6 mx-auto mb-2 ' + (category === cat.key ? 'text-primary' : 'text-muted-foreground')} />
              <p className="text-sm font-medium text-foreground">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{cat.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-card rounded-3xl border border-border/50 p-5 sm:p-6 mb-8 shadow-soft">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Make it your kind of date</h2>
            <p className="text-xs text-muted-foreground mt-1">Your filters now change the suggestions shown below.</p>
          </div>
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Neighborhood</Label>
            <Input value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setGenerated(false); }} placeholder="e.g. Hauz Khas" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Maximum budget per person (₹)</Label>
            <Input inputMode="numeric" value={budget} onChange={(e) => { setBudget(e.target.value); setGenerated(false); }} placeholder="e.g. 1500" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Preferred date</Label>
            <Input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button onClick={() => { setGenerated(true); toast.success(ideas.length ? 'Date ideas are ready.' : 'No ideas match those filters. Try a higher budget or another area.'); }} className="rounded-full bg-burgundy-gradient hover:opacity-90">
            <Sparkles className="w-4 h-4 mr-2" /> Find date ideas
          </Button>
          <Button variant="outline" onClick={() => { setNeighborhood(''); setBudget(''); setDate(''); setGenerated(false); }} className="rounded-full">
            Clear filters
          </Button>
        </div>
      </section>

      {generated && (
        <section className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Ideas worth saying yes to</h2>
              <p className="text-sm text-muted-foreground mt-1">{ideas.length} suggestion{ideas.length === 1 ? '' : 's'} match your current filters.</p>
            </div>
            <span className="text-xs text-muted-foreground bg-accent/10 px-3 py-1.5 rounded-full">Curated demo ideas · verify details before visiting</span>
          </div>

          {ideas.length === 0 && (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground">No matches for these filters</h3>
              <p className="text-sm text-muted-foreground mt-1">Try a nearby neighborhood, increase your budget, or choose another date category.</p>
            </div>
          )}

          {ideas.map((idea) => {
            const isSaved = savedIds.has(idea.title);
            return (
              <article key={idea.id} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card transition-all">
                <div className="grid sm:grid-cols-3 gap-0">
                  <div className="aspect-[16/10] sm:aspect-auto relative overflow-hidden bg-muted">
                    <Image width={1200} height={800} unoptimized src={idea.image} alt={idea.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="sm:col-span-2 p-5 sm:p-6 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-foreground">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{idea.desc}</p>
                      <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {idea.neighborhood}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {idea.budget}</span>
                        {date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {date}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      <Button size="sm" disabled={savingId === idea.id} onClick={() => void saveIdea(idea)} className="rounded-full bg-burgundy-gradient hover:opacity-90">
                        {savingId === idea.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : isSaved ? <BookmarkCheck className="w-3.5 h-3.5 mr-1" /> : <Heart className="w-3.5 h-3.5 mr-1" />}
                        {isSaved ? 'Saved · Remove' : 'Save plan'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void copyIdea(idea)} className="rounded-full">
                        <ClipboardCopy className="w-3.5 h-3.5 mr-1" /> Copy to share
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Your saved ideas</h2>
            <p className="text-sm text-muted-foreground mt-1">Keep date inspiration in one place for later.</p>
          </div>
          {savedPlans.length > 0 && <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">{savedPlans.length} saved</span>}
        </div>

        {!user ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Sign in to save date ideas to your account.</div>
        ) : savedLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-5"><Loader2 className="w-4 h-4 animate-spin" /> Loading your saved ideas…</div>
        ) : savedPlans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <BookmarkCheck className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Your saved ideas will appear here. Find an idea above and select Save plan.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {savedPlans.map((plan) => (
              <article key={plan.id} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3">
                <Image width={1200} height={800} unoptimized src={plan.image_url} alt="" loading="lazy" className="w-24 h-24 rounded-xl object-cover bg-muted" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground">{plan.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{plan.neighborhood} · {plan.budget_label}</p>
                  {plan.preferred_date && <p className="text-xs text-muted-foreground mt-1">Preferred date: {plan.preferred_date}</p>}
                  <button type="button" onClick={() => void saveIdea({ id: plan.title, title: plan.title, desc: plan.description, neighborhood: plan.neighborhood, budget: plan.budget_label, image: plan.image_url })} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                    <Trash2 className="w-3 h-3" /> Remove saved idea
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 rounded-2xl p-5 sm:p-6 border border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">The next step: plan together</h3>
            <p className="text-sm text-muted-foreground mt-1">These suggestions are currently curated demo ideas, not live booking inventory. Saving is private to your account; use Copy to share to send an idea in your match chat. Shared voting and confirmed reservations can be added as the next product milestone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
