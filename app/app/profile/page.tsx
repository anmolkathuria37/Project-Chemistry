'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Camera, Check, Edit2, MapPin, Briefcase, GraduationCap, Shield, Heart, X } from 'lucide-react';
import { toast } from 'sonner';

const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  const [fullName, setFullName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPronouns(profile.pronouns || '');
      setGender(profile.gender || '');
      setOccupation(profile.occupation || '');
      setEducation(profile.education || '');
      setCity(profile.city || '');
      setNeighborhood(profile.neighborhood || '');
      setBio(profile.bio || '');
      setPhotos(profile.photos || []);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchInterests = async () => {
      const { data: ui } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', user.id);
      if (ui && ui.length > 0) {
        const { data: interestData } = await supabase
          .from('interests')
          .select('name')
          .in('id', ui.map((u) => u.interest_id));
        setInterests(interestData?.map((i) => i.name) || []);
      }
    };
    fetchInterests();
  }, [user]);

  const addPhoto = () => {
    if (!photoUrl.trim() || photos.length >= 6) return;
    if (photos.includes(photoUrl.trim())) return;
    setPhotos([...photos, photoUrl.trim()]);
    setPhotoUrl('');
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url));
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const completion = Math.min(100, Math.round(
        ((fullName ? 15 : 0) +
        (photos.length > 0 ? 20 : 0) +
        (bio ? 15 : 0) +
        (gender ? 10 : 0) +
        (occupation ? 10 : 0) +
        (neighborhood ? 10 : 0) +
        (interests.length >= 3 ? 20 : 0))
      ));

      const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        pronouns,
        gender,
        occupation,
        education,
        city,
        neighborhood,
        bio,
        photos,
        profile_completion: completion,
      }).eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const age = calculateAge(profile?.date_of_birth || null);

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
        {!editing ? (
          <Button variant="outline" className="rounded-full" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setEditing(false)}>Cancel</Button>
            <Button className="rounded-full bg-burgundy-gradient hover:opacity-90" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Check className="w-4 h-4 mr-1" /> Save</>}
            </Button>
          </div>
        )}
      </div>

      {/* Profile completion */}
      {profile && profile.profile_completion < 100 && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 mb-6 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Profile Completion</p>
            <p className="text-sm font-semibold text-primary">{profile.profile_completion}%</p>
          </div>
          <Progress value={profile.profile_completion} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">Complete your profile to get better matches.</p>
        </div>
      )}

      {/* Photos */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <h2 className="font-semibold text-foreground mb-4">Photos</h2>
        {editing ? (
          <>
            <div className="flex gap-3 mb-4">
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste image URL..."
                className="rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
              />
              <Button onClick={addPhoto} className="rounded-xl" disabled={photos.length >= 6}>
                <Camera className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((url, i) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-xs py-1 text-center font-medium">Main</div>
                  )}
                  <button onClick={() => removePhoto(url)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.length > 0 ? photos.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground col-span-3">No photos yet.</p>
            )}
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <h2 className="font-semibold text-foreground mb-4">About</h2>
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input id="pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <button key={g} onClick={() => setGender(g)} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${gender === g ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input id="education" value={education} onChange={(e) => setEducation(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl min-h-[120px] resize-none" maxLength={500} />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {profile?.full_name}{age !== null && `, ${age}`}
              </h3>
              {profile?.pronouns && <p className="text-sm text-muted-foreground mt-0.5">{profile.pronouns}</p>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile?.occupation && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.occupation}</span>}
              {profile?.education && <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {profile.education}</span>}
              {profile?.neighborhood && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.neighborhood}, {profile?.city}</span>}
              {profile?.is_verified && <span className="flex items-center gap-1.5 text-primary"><Shield className="w-4 h-4" /> Verified</span>}
            </div>
            {profile?.bio && <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>}
          </div>
        )}
      </div>

      {/* Interests */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-soft">
        <h2 className="font-semibold text-foreground mb-4">Interests</h2>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
                <Heart className="w-3 h-3" /> {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No interests selected yet. Edit your profile during onboarding to add interests.</p>
        )}
      </div>

      {/* Verification */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-soft">
        <h2 className="font-semibold text-foreground mb-2">Verification</h2>
        <p className="text-sm text-muted-foreground mb-4">Verified profiles get more matches and trust from the community.</p>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.is_verified ? 'bg-green-100' : 'bg-secondary'}`}>
            <Shield className={`w-5 h-5 ${profile?.is_verified ? 'text-green-600' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{profile?.is_verified ? 'Verified' : 'Not verified yet'}</p>
            <p className="text-xs text-muted-foreground">{profile?.is_verified ? 'Your identity has been confirmed' : 'Verification coming soon'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
