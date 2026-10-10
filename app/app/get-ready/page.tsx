'use client';

import { useState } from 'react';
import { Shirt, Sparkles, Footprints, Watch, Gift, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Look = {
  title: string;
  image: string;
  items: string[];
  budget: string;
  tags: string[];
};

const LOOKS: Record<string, Look[]> = {
  dinner: [
    {
      title: 'Classic Elegance',
      image: 'https://images.pexels.com/photos/36534064/pexels-photo-36534064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      items: ['Fitted blazer', 'Silk blouse', 'Tailored trousers', 'Heeled ankle boots'],
      budget: '₹3,000 - ₹6,000',
      tags: ['Smart casual', 'Timeless', 'Refined'],
    },
    {
      title: 'Modern Minimal',
      image: 'https://images.pexels.com/photos/818995/pexels-photo-818995.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      items: ['Wrap dress', 'Minimalist jewelry', 'Block heels', 'Clutch'],
      budget: '₹2,000 - ₹4,500',
      tags: ['Minimal', 'Chic', 'Effortless'],
    },
    {
      title: 'Bold Statement',
      image: 'https://images.pexels.com/photos/39371074/pexels-photo-39371074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      items: ['Statement top', 'High-waist skirt', 'Strappy heels', 'Drop earrings'],
      budget: '₹2,500 - ₹5,000',
      tags: ['Bold', 'Trendy', 'Confident'],
    },
  ],
  coffee: [
    {
      title: 'Casual Cool',
      image: 'https://images.pexels.com/photos/4255394/pexels-photo-4255394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      items: ['Oversized sweater', 'Straight jeans', 'White sneakers', 'Crossbody bag'],
      budget: '₹1,000 - ₹3,000',
      tags: ['Casual', 'Comfortable', 'Effortless'],
    },
  ],
  rooftop: [
    {
      title: 'Sunset Glamour',
      image: 'https://images.pexels.com/photos/5019013/pexels-photo-5019013.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      items: ['Midi dress', 'Statement earrings', 'Wedge sandals', 'Evening clutch'],
      budget: '₹2,500 - ₹5,500',
      tags: ['Elegant', 'Rooftop-ready', 'Romantic'],
    },
  ],
};

const DATE_TYPES = [
  { key: 'dinner', label: 'Dinner Date', icon: Sparkles },
  { key: 'coffee', label: 'Coffee Date', icon: Shirt },
  { key: 'rooftop', label: 'Rooftop Evening', icon: Heart },
];

export default function GetReadyPage() {
  const [selectedDate, setSelectedDate] = useState('dinner');
  const [savedLooks, setSavedLooks] = useState<string[]>([]);

  const looks = LOOKS[selectedDate] || [];

  const toggleSave = (title: string) => {
    setSavedLooks((prev) => prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Shirt className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Get Date Ready</h1>
        <p className="text-muted-foreground text-sm mt-1">Outfit inspiration and styling tips for your next date.</p>
      </div>

      {/* Date type selector */}
      <div className="flex justify-center gap-3 mb-8">
        {DATE_TYPES.map((dt) => (
          <button
            key={dt.key}
            onClick={() => setSelectedDate(dt.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedDate === dt.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            }`}
          >
            <dt.icon className="w-4 h-4" /> {dt.label}
          </button>
        ))}
      </div>

      {/* Looks */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {looks.map((look) => (
          <div key={look.title} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card transition-all group">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img src={look.image} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <button
                onClick={() => toggleSave(look.title)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition-colors"
              >
                <Heart className={`w-4 h-4 ${savedLooks.includes(look.title) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg font-bold text-foreground">{look.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {look.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{tag}</span>
                ))}
              </div>
              <div className="mt-3 space-y-1">
                {look.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Estimated budget</p>
                <p className="text-sm font-semibold text-foreground">{look.budget}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional categories */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Footprints, title: 'Footwear', desc: 'From casual sneakers to elegant heels' },
          { icon: Watch, title: 'Accessories', desc: 'Watches, jewelry, and finishing touches' },
          { icon: Gift, title: 'Gifts', desc: 'Thoughtful ideas for your date' },
        ].map((cat) => (
          <div key={cat.title} className="bg-card rounded-2xl border border-border/50 p-5 text-center shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <cat.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{cat.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div className="bg-accent/10 rounded-xl p-4 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/70">
          Outfit suggestions are for inspiration only. Product links, sizes, and availability from partner brands will be available in a future update. We never imply you need to purchase anything to be worthy of a date.
        </p>
      </div>
    </div>
  );
}
