'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Heart, ArrowLeft, ArrowRight, Check, Sparkles, Camera } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['basics', 'photos', 'about', 'preferences', 'interests'] as const;
type Step = typeof STEPS[number];

const INTEREST_CATEGORIES: Record<string, string[]> = {
  'Food & Drink': ['Coffee', 'Street Food', 'Fine Dining', 'Cooking', 'Baking', 'Wine Tasting'],
  'Entertainment': ['Movies', 'Live Music', 'Theatre', 'Comedy Shows', 'Concerts'],
  'Creative': ['Photography', 'Painting', 'Writing', 'Design', 'Reading', 'Dance', 'Singing'],
  'Outdoors': ['Hiking', 'Cycling', 'Running'],
  'Fitness': ['Yoga', 'Gym'],
  'Sports': ['Cricket', 'Football', 'Tennis'],
  'Lifestyle': ['Travel', 'Weekend Getaways', 'Exploring Cafes', 'Fashion', 'Pets', 'Plant Parenting'],
  'Culture': ['Museums', 'Art Galleries', 'History'],
  'Games': ['Board Games', 'Video Games'],
};

const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];
const INTENTIONS = [
  { value: 'serious', label: 'A serious relationship' },
  { value: 'casual', label: 'Casual dating' },
  { value: 'friendship', label: 'Making friends' },
  { value: 'exploring', label: 'Still figuring it out' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [step, setStep] = useState<Step>('basics');
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [neighborhood, setNeighborhood] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [lookingFor, setLookingFor] = useState('exploring');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(45);
  const [distanceKm, setDistanceKm] = useState(25);
  const [budgetMin, setBudgetMin] = useState(500);
  const [budgetMax, setBudgetMax] = useState(3000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && profile) {
      setFullName(profile.full_name || '');
      setPronouns(profile.pronouns || '');
      setGender(profile.gender || '');
      setOccupation(profile.occupation || '');
      setEducation(profile.education || '');
      setCity(profile.city || 'Delhi NCR');
      setNeighborhood(profile.neighborhood || '');
      setBio(profile.bio || '');
      setPhotos(profile.photos || []);
      if (profile.onboarding_completed) {
        router.push('/app/discover');
      }
    }
  }, [loading, user, profile, router]);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const toggleInterest = (name: string) => {
    setSelectedInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : prev.length < 10 ? [...prev, name] : prev
    );
  };

  const addPhoto = () => {
    if (!photoUrl.trim()) return;
    if (photos.length >= 6) {
      toast.error('You can add up to 6 photos.');
      return;
    }
    if (photos.includes(photoUrl.trim())) {
      toast.error('That photo is already added.');
      return;
    }
    setPhotos([...photos, photoUrl.trim()]);
    setPhotoUrl('');
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url));
  };

  const saveAndNext = async () => {
    if (!user) return;

    setSaving(true);
    try {
      if (step === 'basics') {
        if (!fullName.trim()) {
          toast.error('Please enter your name.');
          setSaving(false);
          return;
        }
        if (!gender) {
          toast.error('Please select your gender.');
          setSaving(false);
          return;
        }
        const { error } = await supabase.from('profiles').update({
          full_name: fullName,
          pronouns,
          gender,
          occupation,
          education,
          city,
          neighborhood,
        }).eq('id', user.id);
        if (error) throw error;
      } else if (step === 'photos') {
        if (photos.length === 0) {
          toast.error('Please add at least one photo.');
          setSaving(false);
          return;
        }
        const { error } = await supabase.from('profiles').update({
          photos,
        }).eq('id', user.id);
        if (error) throw error;
      } else if (step === 'about') {
        if (!bio.trim()) {
          toast.error('Please write a short bio.');
          setSaving(false);
          return;
        }
        const { error } = await supabase.from('profiles').update({
          bio,
        }).eq('id', user.id);
        if (error) throw error;
      } else if (step === 'preferences') {
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
      } else if (step === 'interests') {
        if (selectedInterests.length < 3) {
          toast.error('Please select at least 3 interests.');
          setSaving(false);
          return;
        }

        // Fetch interest IDs
        const { data: interestRows } = await supabase
          .from('interests')
          .select('id, name')
          .in('name', selectedInterests);

        if (interestRows) {
          // Delete old interests
          await supabase.from('user_interests').delete().eq('user_id', user.id);

          // Insert new interests
          const inserts = interestRows.map((i) => ({
            user_id: user.id,
            interest_id: i.id,
          }));
          await supabase.from('user_interests').insert(inserts);
        }

        const completion = Math.min(
          100,
          Math.round(
            ((fullName ? 15 : 0) +
            (photos.length > 0 ? 20 : 0) +
            (bio ? 15 : 0) +
            (gender ? 10 : 0) +
            (occupation ? 10 : 0) +
            (neighborhood ? 10 : 0) +
            (selectedInterests.length >= 3 ? 20 : 0)) * 1
          )
        );

        const { error } = await supabase.from('profiles').update({
          onboarding_completed: true,
          profile_completion: completion,
        }).eq('id', user.id);
        if (error) throw error;

        toast.success('Profile complete! Welcome to Chemistry.');
        router.push('/app/discover');
        return;
      }

      setStep(STEPS[stepIndex + 1]);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gradient flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground capitalize">{step}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-3xl shadow-card border border-border/50 p-8 animate-fade-in">
            {step === 'basics' && (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Let's start with the basics</h1>
                <p className="text-muted-foreground mb-8">This information helps us find compatible people for you.</p>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name *</Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pronouns">Pronouns</Label>
                      <Input id="pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="she/her, he/him..." className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Designer, Student..." className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {GENDERS.map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                            gender === g
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-background hover:border-primary/30'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Neighborhood</Label>
                      <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Hauz Khas, CP..." className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input id="education" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Your education background" className="rounded-xl" />
                  </div>
                </div>
              </>
            )}

            {step === 'photos' && (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Add your photos</h1>
                <p className="text-muted-foreground mb-8">Add up to 6 photos. Your first photo will be your main profile picture.</p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Paste an image URL..."
                      className="rounded-xl"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
                    />
                    <Button onClick={addPhoto} className="rounded-xl px-4" disabled={photos.length >= 6}>
                      <Camera className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((url, i) => (
                      <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-xs py-1 text-center font-medium">
                            Main Photo
                          </div>
                        )}
                        <button
                          onClick={() => removePhoto(url)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: Use clear, well-lit photos that show your personality. In production, you'll be able to upload directly from your device.
                  </p>
                </div>
              </>
            )}

            {step === 'about' && (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Tell us about you</h1>
                <p className="text-muted-foreground mb-8">Your bio is your chance to show your personality. Be yourself!</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="I'm a creative soul who loves exploring new cafés, indie music, and weekend photography walks..."
                      className="rounded-xl min-h-[150px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                  </div>
                </div>
              </>
            )}

            {step === 'preferences' && (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">What are you looking for?</h1>
                <p className="text-muted-foreground mb-8">Help us match you with the right people.</p>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Relationship intention</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {INTENTIONS.map((intent) => (
                        <button
                          key={intent.value}
                          onClick={() => setLookingFor(intent.value)}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                            lookingFor === intent.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-background hover:border-primary/30'
                          }`}
                        >
                          {intent.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum age: {ageMin}</Label>
                      <input type="range" min={18} max={60} value={ageMin} onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax))} className="w-full accent-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum age: {ageMax}</Label>
                      <input type="range" min={18} max={80} value={ageMax} onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))} className="w-full accent-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum distance: {distanceKm} km</Label>
                    <input type="range" min={1} max={100} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min date budget: ₹{budgetMin}</Label>
                      <input type="range" min={0} max={5000} step={100} value={budgetMin} onChange={(e) => setBudgetMin(Math.min(Number(e.target.value), budgetMax))} className="w-full accent-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max date budget: ₹{budgetMax}</Label>
                      <input type="range" min={0} max={10000} step={100} value={budgetMax} onChange={(e) => setBudgetMax(Math.max(Number(e.target.value), budgetMin))} className="w-full accent-primary" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 'interests' && (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">What do you love?</h1>
                <p className="text-muted-foreground mb-2">Pick at least 3 interests. These help us find people who share your passions.</p>
                <p className="text-xs text-muted-foreground mb-6">{selectedInterests.length}/10 selected</p>
                <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
                  {Object.entries(INTEREST_CATEGORIES).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-foreground mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleInterest(item)}
                            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedInterests.includes(item)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                            }`}
                          >
                            {selectedInterests.includes(item) && <Check className="w-3.5 h-3.5 inline mr-1" />}
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => stepIndex > 0 && setStep(STEPS[stepIndex - 1])}
                disabled={stepIndex === 0}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={saveAndNext}
                disabled={saving}
                className="rounded-xl bg-burgundy-gradient hover:opacity-90"
              >
                {saving ? 'Saving...' : step === 'interests' ? (
                  <>Complete <Sparkles className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
