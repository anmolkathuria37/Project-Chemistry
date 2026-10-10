'use client';

import { useState } from 'react';
import { Calendar, Coffee, Utensils, Film, Music, MapPin, DollarSign, Sparkles, Heart, ArrowRight, Clock, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DATE_CATEGORIES = [
  { key: 'coffee', label: 'Coffee Date', icon: Coffee, desc: 'Keep it simple and warm' },
  { key: 'dinner', label: 'Dinner', icon: Utensils, desc: 'Classic and romantic' },
  { key: 'movie', label: 'Movie + Food', icon: Film, desc: 'Dinner and a show' },
  { key: 'live', label: 'Live Music', icon: Music, desc: 'For music lovers' },
  { key: 'surprise', label: 'Surprise Date', icon: Sparkles, desc: 'Let fate decide' },
];

const DATE_IDEAS: Record<string, { title: string; desc: string; neighborhood: string; budget: string; image: string }[]> = {
  coffee: [
    { title: 'Café Hopping in Hauz Khas', desc: 'Start at The Rose Cafe, then stroll to Depaul\'s for a second cup. Great for first dates — casual, easy to extend or end early.', neighborhood: 'Hauz Khas Village', budget: '₹500 - ₹1,000 per person', image: 'https://images.pexels.com/photos/8836421/pexels-photo-8836421.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { title: 'Quiet Corner at Café Lota', desc: 'A calm café with regional Indian cuisine inside the Crafts Museum. Perfect for deep conversations.', neighborhood: 'Pragati Maidan', budget: '₹600 - ₹1,200 per person', image: 'https://images.pexels.com/photos/4255394/pexels-photo-4255394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  dinner: [
    { title: 'Rooftop at Qla', desc: 'European cuisine with a stunning view of the Qutub Minar. Perfect for a special evening.', neighborhood: 'Mehrauli', budget: '₹2,000 - ₹3,500 per person', image: 'https://images.pexels.com/photos/5019013/pexels-photo-5019013.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { title: 'Fine Dining at Indian Accent', desc: 'Award-winning modern Indian cuisine. Book ahead — this is a date they won\'t forget.', neighborhood: 'Lodhi Road', budget: '₹3,000 - ₹5,000 per person', image: 'https://images.pexels.com/photos/9608431/pexels-photo-9608431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  movie: [
    { title: 'PVR ECX + Dinner at Social', desc: 'Premium cinema experience at Chanakyapuri, followed by dinner and drinks at Social Hauz Khas.', neighborhood: 'Chanakyapuri → Hauz Khas', budget: '₹1,200 - ₹2,500 per person', image: 'https://images.pexels.com/photos/5911173/pexels-photo-5911173.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  live: [
    { title: 'Live Music at AntiSocial', desc: 'Indie bands and great food in a relaxed, fun atmosphere. Perfect for music-loving couples.', neighborhood: 'RK Puram', budget: '₹800 - ₹2,000 per person', image: 'https://images.pexels.com/photos/2513611/pexels-photo-2513611.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
  surprise: [
    { title: 'Art + Coffee Date', desc: 'Start at the National Gallery of Modern Art, then walk to a nearby café. Culture + conversation = magic.', neighborhood: 'India Gate area', budget: '₹300 - ₹800 per person', image: 'https://images.pexels.com/photos/1303753/pexels-photo-1303753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ],
};

export default function PlannerPage() {
  const [category, setCategory] = useState('coffee');
  const [neighborhood, setNeighborhood] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [generated, setGenerated] = useState(false);

  const ideas = DATE_IDEAS[category] || [];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Date Planner</h1>
        <p className="text-muted-foreground text-sm mt-1">Plan a date you'll both love. Pick a vibe, set your preferences, and discover great ideas.</p>
      </div>

      {/* Category selection */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">What kind of date?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {DATE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setCategory(cat.key); setGenerated(false); }}
              className={`p-4 rounded-2xl border text-center transition-all ${
                category === cat.key
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <cat.icon className={`w-6 h-6 mx-auto mb-2 ${category === cat.key ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium text-foreground">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <h2 className="font-semibold text-foreground mb-4">Your Preferences</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Neighborhood</Label>
            <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Hauz Khas, CP..." className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Budget (per person)</Label>
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="₹1,500" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Preferred Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <Button
          onClick={() => { setGenerated(true); toast.success('Date ideas generated!'); }}
          className="mt-4 rounded-full bg-burgundy-gradient hover:opacity-90"
        >
          <Sparkles className="w-4 h-4 mr-1" /> Generate Date Ideas
        </Button>
      </div>

      {/* Results */}
      {generated && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">Date Ideas for You</h2>
            <span className="text-xs text-muted-foreground bg-accent/10 px-3 py-1 rounded-full">Demo suggestions</span>
          </div>

          {ideas.map((idea, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card transition-all">
              <div className="grid sm:grid-cols-3 gap-0">
                <div className="aspect-video sm:aspect-auto relative overflow-hidden">
                  <img src={idea.image} alt={idea.title} className="w-full h-full object-cover" />
                </div>
                <div className="sm:col-span-2 p-5">
                  <h3 className="font-display text-lg font-bold text-foreground">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{idea.desc}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {idea.neighborhood}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {idea.budget}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="rounded-full bg-burgundy-gradient hover:opacity-90">
                      <Heart className="w-3.5 h-3.5 mr-1" /> Save Plan
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full">
                      <ArrowRight className="w-3.5 h-3.5 mr-1" /> Share with Match
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Plan together with your match</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  In the full version, you and your match can vote on date ideas, propose alternatives, and build a shared itinerary together — all within your conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!generated && (
        <div className="bg-card rounded-3xl border border-border/50 p-8 text-center shadow-soft">
          <Sparkles className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Pick a date category and tap "Generate Date Ideas" to see personalized suggestions.</p>
        </div>
      )}
    </div>
  );
}
