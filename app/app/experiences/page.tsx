'use client';

import Image from 'next/image';

import { useState } from 'react';
import { Coffee, Film, Music, Utensils, Palette, Gamepad2, Mountain, Sparkles, MapPin, Search, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Venue = {
  name: string;
  category: string;
  neighborhood: string;
  priceRange: string;
  image: string;
  rating: number;
  tags: string[];
  isDemo: boolean;
};

const CATEGORIES = [
  { label: 'All', icon: Sparkles },
  { label: 'Cafés', icon: Coffee },
  { label: 'Restaurants', icon: Utensils },
  { label: 'Movies', icon: Film },
  { label: 'Events', icon: Music },
  { label: 'Culture', icon: Palette },
  { label: 'Activities', icon: Gamepad2 },
];

const VENUES: Venue[] = [
  { name: 'The Rose Cafe', category: 'Cafés', neighborhood: 'Hauz Khas', priceRange: '₹₹', image: 'https://images.pexels.com/photos/8836421/pexels-photo-8836421.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.6, tags: ['Quiet', 'Outdoor seating', 'Great coffee'], isDemo: true },
  { name: 'Café Lota', category: 'Cafés', neighborhood: 'Pragati Maidan', priceRange: '₹₹', image: 'https://images.pexels.com/photos/4255394/pexels-photo-4255394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.5, tags: ['Regional cuisine', 'Cozy'], isDemo: true },
  { name: 'Indian Accent', category: 'Restaurants', neighborhood: 'Lodhi Road', priceRange: '₹₹₹₹', image: 'https://images.pexels.com/photos/9608431/pexels-photo-9608431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.8, tags: ['Fine dining', 'Date night', 'Award-winning'], isDemo: true },
  { name: 'Social Bar & Kitchen', category: 'Restaurants', neighborhood: 'Hauz Khas', priceRange: '₹₹₹', image: 'https://images.pexels.com/photos/5911173/pexels-photo-5911173.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.3, tags: ['Lively', 'Cocktails', 'Rooftop'], isDemo: true },
  { name: 'PVR ECX Chanakyapuri', category: 'Movies', neighborhood: 'Chanakyapuri', priceRange: '₹₹₹', image: 'https://images.pexels.com/photos/7991478/pexels-photo-7991478.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.4, tags: ['Premium cinema', 'Recliner seats', 'Dolby Atmos'], isDemo: true },
  { name: 'Kingdom of Dreams', category: 'Events', neighborhood: 'Gurugram', priceRange: '₹₹₹', image: 'https://images.pexels.com/photos/2513611/pexels-photo-2513611.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.2, tags: ['Live shows', 'Cultural', 'Theatre'], isDemo: true },
  { name: 'National Gallery of Modern Art', category: 'Culture', neighborhood: 'India Gate', priceRange: '₹', image: 'https://images.pexels.com/photos/1303753/pexels-photo-1303753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.5, tags: ['Art', 'Quiet', 'Indoor'], isDemo: true },
  { name: 'Smaash Cyberhub', category: 'Activities', neighborhood: 'Gurugram', priceRange: '₹₹₹', image: 'https://images.pexels.com/photos/30505259/pexels-photo-30505259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.1, tags: ['Bowling', 'Arcade', 'Interactive'], isDemo: true },
  { name: 'Qla', category: 'Restaurants', neighborhood: 'Mehrauli', priceRange: '₹₹₹₹', image: 'https://images.pexels.com/photos/5019013/pexels-photo-5019013.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.6, tags: ['Rooftop', 'European', 'Date night'], isDemo: true },
  { name: 'Depaul\'s Coffee', category: 'Cafés', neighborhood: 'Connaught Place', priceRange: '₹', image: 'https://images.pexels.com/photos/5225284/pexels-photo-5225284.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', rating: 4.0, tags: ['Budget-friendly', 'Iconic', 'Coffee'], isDemo: true },
];

export default function ExperiencesPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filtered = VENUES.filter((v) => {
    if (category !== 'All' && v.category !== category) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.neighborhood.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleFav = (name: string) => {
    setFavorites((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-8 pb-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Experiences</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover cafés, restaurants, movies, and activities perfect for your next date.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or neighborhood..."
          className="rounded-full pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              }`}
            >
              <cat.icon className="w-4 h-4" /> {cat.label}
            </button>
          );
        })}
      </div>

      {/* Demo data notice */}
      <div className="bg-accent/10 rounded-xl p-3 mb-6 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
        <p className="text-xs text-foreground/70">These are demo listings for illustration. Real venue data will be available through partner integrations.</p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((venue) => (
            <div key={venue.name} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card transition-all group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image width={1200} height={800} unoptimized src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button
                  onClick={() => toggleFav(venue.name)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(venue.name) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                </button>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-foreground">
                  {venue.priceRange}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{venue.name}</h3>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-0.5 flex-shrink-0">
                    ★ {venue.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" /> {venue.neighborhood}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {venue.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 p-12 text-center shadow-soft">
          <p className="text-muted-foreground">No venues found matching your search. Try a different category or keyword.</p>
        </div>
      )}
    </div>
  );
}
