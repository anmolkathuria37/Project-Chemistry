'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import type { Profile, Match } from '@/lib/supabase-client';
import { Heart, MessageCircle, Sparkles, Shield } from 'lucide-react';

type MatchWithProfile = Match & {
  other_profile: Profile;
  conversation_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
};

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const { data: matchesData } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (!matchesData || matchesData.length === 0) {
          setMatches([]);
          return;
        }

        const enriched: MatchWithProfile[] = [];
        for (const m of matchesData as Match[]) {
          const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .maybeSingle();

          const { data: convo } = await supabase
            .from('conversations')
            .select('id, last_message_at')
            .eq('match_id', m.id)
            .maybeSingle();

          let lastMessage: string | null = null;
          let lastMessageAt: string | null = convo?.last_message_at || null;

          if (convo) {
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', convo.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (lastMsg) {
              lastMessage = lastMsg.content;
              lastMessageAt = lastMsg.created_at;
            }
          }

          if (otherProfile) {
            enriched.push({
              ...m,
              other_profile: otherProfile as Profile,
              conversation_id: convo?.id || null,
              last_message: lastMessage,
              last_message_at: lastMessageAt,
            });
          }
        }

        // Sort: those with messages first, then by match date
        enriched.sort((a, b) => {
          if (a.last_message_at && b.last_message_at) {
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
          }
          if (a.last_message_at) return -1;
          if (b.last_message_at) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setMatches(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Matches</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const newMatches = matches.filter((m) => !m.last_message);
  const conversations = matches.filter((m) => m.last_message);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">Matches</h1>

      {matches.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border/50 p-12 text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">No matches yet</h2>
          <p className="text-muted-foreground mb-6">Start discovering people — when you both like each other, your matches will appear here.</p>
          <Link href="/app/discover" className="inline-flex items-center justify-center rounded-full bg-burgundy-gradient text-white px-6 h-11 text-sm font-medium hover:opacity-90 transition-opacity">
            Go to Discover
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {newMatches.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                New Matches ({newMatches.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {newMatches.map((m) => (
                  <Link
                    key={m.id}
                    href={m.conversation_id ? `/app/messages/${m.conversation_id}` : `/app/matches`}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-card border border-border/50">
                      {m.other_profile.photos?.[0] ? (
                        <img src={m.other_profile.photos[0]} alt={m.other_profile.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Heart className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="font-semibold text-sm truncate">{m.other_profile.full_name}</p>
                        <p className="text-xs opacity-80 truncate">{m.other_profile.neighborhood}</p>
                      </div>
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {conversations.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Conversations ({conversations.length})
              </h2>
              <div className="space-y-2">
                {conversations.map((m) => (
                  <Link
                    key={m.id}
                    href={`/app/messages/${m.conversation_id}`}
                    className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/50 hover:border-primary/30 hover:shadow-card transition-all"
                  >
                    {m.other_profile.photos?.[0] ? (
                      <img src={m.other_profile.photos[0]} alt={m.other_profile.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground truncate">{m.other_profile.full_name}</p>
                        {m.other_profile.is_verified && <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{m.last_message}</p>
                    </div>
                    <MessageCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
