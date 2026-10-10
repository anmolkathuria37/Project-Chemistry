'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Heart, MapPin, DollarSign, Users, Save } from 'lucide-react';
import { toast } from 'sonner';

const INTENTIONS = [
  { value: 'serious', label: 'A serious relationship' },
  { value: 'casual', label: 'Casual dating' },
  { value: 'friendship', label: 'Making friends' },
  { value: 'exploring', label: 'Still figuring it out' },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(45);
  const [distanceKm, setDistanceKm] = useState(25);
  const [lookingFor, setLookingFor] = useState('exploring');
  const [budgetMin, setBudgetMin] = useState(500);
  const [budgetMax, setBudgetMax] = useState(3000);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPrefs = async () => {
      const { data } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setAgeMin(data.age_min);
        setAgeMax(data.age_max);
        setDistanceKm(data.distance_km);
        setLookingFor(data.looking_for);
        setBudgetMin(data.budget_min);
        setBudgetMax(data.budget_max);
      }
      setLoaded(true);
    };
    fetchPrefs();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('preferences').update({
          age_min: ageMin,
          age_max: ageMax,
          distance_km: distanceKm,
          looking_for: lookingFor,
          budget_min: budgetMin,
          budget_max: budgetMax,
        }).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('preferences').insert({
          user_id: user.id,
          age_min: ageMin,
          age_max: ageMax,
          distance_km: distanceKm,
          looking_for: lookingFor,
          budget_min: budgetMin,
          budget_max: budgetMax,
        });
        if (error) throw error;
      }
      toast.success('Preferences saved!');
    } catch {
      toast.error('Could not save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!loaded) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="h-8 w-48 rounded-lg shimmer mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">Settings</h1>

      {/* Discovery Preferences */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Discovery Preferences</h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Relationship intention</Label>
            <div className="grid grid-cols-2 gap-2">
              {INTENTIONS.map((intent) => (
                <button
                  key={intent.value}
                  onClick={() => setLookingFor(intent.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                    lookingFor === intent.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {intent.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Minimum age: <span className="text-primary font-semibold">{ageMin}</span></Label>
              <input type="range" min={18} max={60} value={ageMin} onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax))} className="w-full accent-primary" />
            </div>
            <div>
              <Label className="mb-2 block">Maximum age: <span className="text-primary font-semibold">{ageMax}</span></Label>
              <input type="range" min={18} max={80} value={ageMax} onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))} className="w-full accent-primary" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block flex items-center gap-1"><MapPin className="w-4 h-4" /> Maximum distance: <span className="text-primary font-semibold">{distanceKm} km</span></Label>
            <input type="range" min={1} max={100} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className="w-full accent-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block flex items-center gap-1"><DollarSign className="w-4 h-4" /> Min budget: <span className="text-primary font-semibold">₹{budgetMin}</span></Label>
              <input type="range" min={0} max={5000} step={100} value={budgetMin} onChange={(e) => setBudgetMin(Math.min(Number(e.target.value), budgetMax))} className="w-full accent-primary" />
            </div>
            <div>
              <Label className="mb-2 block flex items-center gap-1"><DollarSign className="w-4 h-4" /> Max budget: <span className="text-primary font-semibold">₹{budgetMax}</span></Label>
              <input type="range" min={0} max={10000} step={100} value={budgetMax} onChange={(e) => setBudgetMax(Math.max(Number(e.target.value), budgetMin))} className="w-full accent-primary" />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 rounded-full bg-burgundy-gradient hover:opacity-90">
          <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Account */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">Email</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">Account type</span>
            <span className="text-sm text-muted-foreground">Free member</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card rounded-3xl border border-destructive/20 p-6 shadow-soft">
        <h2 className="font-semibold text-destructive mb-4">Account Actions</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full rounded-xl" onClick={handleSignOut}>
            Sign Out
          </Button>
          <p className="text-xs text-muted-foreground pt-2">
            To delete your account and all associated data, please contact our support team. Your data will be permanently removed in accordance with our privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
