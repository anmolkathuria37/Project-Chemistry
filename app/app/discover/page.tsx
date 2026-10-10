'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import type { Profile, Interest } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Heart, X, Sparkles, Shield, MapPin, Briefcase, GraduationCap, ChevronLeft, ChevronRight, Undo2, Info } from 'lucide-react';
import { toast } from 'sonner';

type DiscoveryProfile = Profile & {
  shared_interests: string[];
  compatibility: number;
  match_reasons: string[];
};

export default function DiscoverPage() {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calculateCompatibility = (target: Profile, myInterests: string[], theirInterests: string[]): { score: number; reasons: string[]; shared: string[] } => {
    const shared = myInterests.filter((i) => theirInterests.includes(i));
    const interestScore = Math.min(40, (shared.length / Math.max(1, Math.max(myInterests.length, theirInterests.length))) * 40);
    const bioScore = target.bio && target.bio.length > 50 ? 15 : 5;
    const photoScore = Math.min(15, (target.photos?.length || 0) * 3);
    const profileScore = (target.occupation ? 10 : 0) + (target.education ? 10 : 0) + (target.neighborhood ? 10 : 0);
    const baseScore = 20;
    const score = Math.round(baseScore + interestScore + bioScore + photoScore + profileScore);

    const reasons: string[] = [];
    if (shared.length >= 3) reasons.push(`You share ${shared.length} interests`);
    else if (shared.length > 0) reasons.push(`You both like ${shared.slice(0, 2).join(' and ')}`);
    if (target.neighborhood && profile?.neighborhood && target.neighborhood === profile.neighborhood) {
      reasons.push(`You're both in ${target.neighborhood}`);
    }
    if (target.occupation) reasons.push(`${target.occupation}`);
    if (target.education) reasons.push(`${target.education}`);
    if (reasons.length === 0) reasons.push('New to your area');

    return { score: Math.min(99, score), reasons, shared };
  };

  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get my interests
      const { data: myInterestRows } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', user.id);
      const myInterestIds = myInterestRows?.map((r) => r.interest_id) || [];

      // Get interest names
      let myInterestNames: string[] = [];
      if (myInterestIds.length > 0) {
        const { data: myInterestsData } = await supabase
          .from('interests')
          .select('name')
          .in('id', myInterestIds);
        myInterestNames = myInterestsData?.map((i) => i.name) || [];
      }

      // Get profiles I've already liked or passed
      const { data: likedRows } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id);
      const likedIds = likedRows?.map((r) => r.liked_id) || [];

      const { data: passedRows } = await supabase
        .from('passes')
        .select('passed_id')
        .eq('passer_id', user.id);
      const passedIds = passedRows?.map((r) => r.passed_id) || [];

      // Get profiles I've blocked
      const { data: blockedRows } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      const blockedIds = blockedRows?.map((r) => r.blocked_id) || [];

      // Get who blocked me
      const { data: blockedMeRows } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocked_id', user.id);
      const blockedMeIds = blockedMeRows?.map((r) => r.blocker_id) || [];

      const excludeIds = [...likedIds, ...passedIds, ...blockedIds, ...blockedMeIds, user.id];

      // Fetch candidate profiles
      const { data: candidates } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('onboarding_completed', true)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(20);

      if (!candidates || candidates.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Fetch interests for all candidates
      const candidateIds = candidates.map((c) => c.id);
      const { data: allUserInterests } = await supabase
        .from('user_interests')
        .select('user_id, interest_id')
        .in('user_id', candidateIds);

      const { data: allInterests } = await supabase
        .from('interests')
        .select('id, name');

      const interestMap = new Map(allInterests?.map((i) => [i.id, i.name]) || []);
      const userInterestsMap = new Map<string, string[]>();

      allUserInterests?.forEach((ui) => {
        const existing = userInterestsMap.get(ui.user_id) || [];
        const name = interestMap.get(ui.interest_id);
        if (name) existing.push(name);
        userInterestsMap.set(ui.user_id, existing);
      });

      const enriched: DiscoveryProfile[] = candidates.map((c) => {
        const theirInterests = userInterestsMap.get(c.id) || [];
        const { score, reasons, shared } = calculateCompatibility(c, myInterestNames, theirInterests);
        return {
          ...c,
          shared_interests: shared,
          compatibility: score,
          match_reasons: reasons,
        };
      });

      // Sort by compatibility
      enriched.sort((a, b) => b.compatibility - a.compatibility);
      setProfiles(enriched);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const currentProfile = profiles[currentIndex];

  const handleLike = async (isSuper = false) => {
    if (!user || !currentProfile) return;
    setLastAction('like');

    try {
      const { error } = await supabase.from('likes').insert({
        liker_id: user.id,
        liked_id: currentProfile.id,
        is_super_like: isSuper,
      });

      if (error && !error.message.includes('duplicate')) throw error;

      // Check if the other person already liked me → match!
      const { data: mutualLike } = await supabase
        .from('likes')
        .select('id')
        .eq('liker_id', currentProfile.id)
        .eq('liked_id', user.id)
        .maybeSingle();

      if (mutualLike) {
        // Create match
        const user1Id = user.id < currentProfile.id ? user.id : currentProfile.id;
        const user2Id = user.id < currentProfile.id ? currentProfile.id : user.id;

        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('user1_id', user1Id)
          .eq('user2_id', user2Id)
          .maybeSingle();

        if (!existingMatch) {
          const { data: newMatch } = await supabase.from('matches').insert({
            user1_id: user1Id,
            user2_id: user2Id,
          }).select().single();

          if (newMatch) {
            await supabase.from('conversations').insert({
              match_id: newMatch.id,
            });
          }

          toast.success(`It's a match with ${currentProfile.full_name}!`, {
            description: 'You can start chatting now.',
          });
        }
      } else {
        if (isSuper) {
          toast(`Super-liked ${currentProfile.full_name}!`);
        }
      }

      setCanUndo(true);
      setPhotoIndex(0);
      setShowDetails(false);
      setCurrentIndex((prev) => prev + 1);
    } catch {
      toast.error('Something went wrong. Try again.');
    }
  };

  const handlePass = async () => {
    if (!user || !currentProfile) return;
    setLastAction('pass');

    try {
      const { error } = await supabase.from('passes').insert({
        passer_id: user.id,
        passed_id: currentProfile.id,
      });

      if (error && !error.message.includes('duplicate')) throw error;

      setCanUndo(true);
      setPhotoIndex(0);
      setShowDetails(false);
      setCurrentIndex((prev) => prev + 1);
    } catch {
      toast.error('Something went wrong. Try again.');
    }
  };

  const handleUndo = async () => {
    if (!user || !canUndo || currentIndex === 0) return;
    const prevProfile = profiles[currentIndex - 1];
    if (!prevProfile) return;

    try {
      if (lastAction === 'like') {
        await supabase.from('likes').delete()
          .eq('liker_id', user.id)
          .eq('liked_id', prevProfile.id);
      } else if (lastAction === 'pass') {
        await supabase.from('passes').delete()
          .eq('passer_id', user.id)
          .eq('passed_id', prevProfile.id);
      }

      setCurrentIndex((prev) => prev - 1);
      setCanUndo(false);
      setLastAction(null);
      setPhotoIndex(0);
      toast('Undid last action.');
    } catch {
      toast.error('Could not undo.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Discover</h1>
          <p className="text-muted-foreground text-sm mt-1">Finding people who get you...</p>
        </div>
        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-3xl shimmer" />
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Discover</h1>
        </div>
        <div className="bg-card rounded-3xl border border-border/50 p-12 text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground mb-6">You've seen everyone in your area for now. Check back later for new people, or adjust your preferences.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { fetchProfiles(); setCurrentIndex(0); }} className="rounded-full">
              Refresh Feed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(currentProfile.date_of_birth);

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Discover</h1>
        <p className="text-muted-foreground text-sm mt-1">{profiles.length - currentIndex} people to meet</p>
      </div>

      {/* Profile Card */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-card bg-card animate-scale-in" key={currentProfile.id}>
          {/* Photo */}
          {currentProfile.photos?.[photoIndex] ? (
            <img
              src={currentProfile.photos[photoIndex]}
              alt={currentProfile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Heart className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Photo navigation */}
          {currentProfile.photos?.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((p) => (p === 0 ? (currentProfile.photos.length - 1) : p - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPhotoIndex((p) => (p === currentProfile.photos.length - 1 ? 0 : p + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Photo dots */}
              <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                {currentProfile.photos.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i === photoIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {currentProfile.full_name}{age !== null && `, ${age}`}
                </h2>
                <div className="flex items-center gap-3 text-sm opacity-90 mt-1">
                  {currentProfile.occupation && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {currentProfile.occupation}
                    </span>
                  )}
                  {currentProfile.neighborhood && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {currentProfile.neighborhood}
                    </span>
                  )}
                </div>
              </div>
              {currentProfile.is_verified && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur rounded-full px-2 py-1 text-xs">
                  <Shield className="w-3 h-3" /> Verified
                </div>
              )}
            </div>

            {/* Compatibility badge */}
            <div className="inline-flex items-center gap-1.5 bg-primary/90 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" /> {currentProfile.compatibility}% Compatible
            </div>

            {showDetails && (
              <div className="animate-fade-in space-y-2">
                {currentProfile.bio && (
                  <p className="text-sm opacity-90 line-clamp-3">{currentProfile.bio}</p>
                )}
                {currentProfile.match_reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfile.match_reasons.slice(0, 3).map((reason) => (
                      <span key={reason} className="text-xs bg-white/20 backdrop-blur rounded-full px-2.5 py-0.5">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
                {currentProfile.shared_interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfile.shared_interests.slice(0, 5).map((interest) => (
                      <span key={interest} className="text-xs bg-accent/80 backdrop-blur rounded-full px-2.5 py-0.5 font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            className="rounded-full w-12 h-12 border-border bg-card"
          >
            <Undo2 className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePass()}
            className="rounded-full w-14 h-14 border-2 border-destructive/30 bg-card hover:bg-destructive/10 hover:border-destructive/50"
          >
            <X className="w-6 h-6 text-destructive" />
          </Button>
          <Button
            size="icon"
            onClick={() => handleLike(true)}
            className="rounded-full w-12 h-12 bg-accent hover:bg-accent/80"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => handleLike(false)}
            className="rounded-full w-14 h-14 bg-burgundy-gradient hover:opacity-90"
          >
            <Heart className="w-6 h-6 text-white" fill="white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-full w-12 h-12 border-border bg-card"
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
