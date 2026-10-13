'use client';

import Image from 'next/image';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import type { Profile, Conversation, Message } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Shield, MoreVertical, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function MessagesListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<{
    id: string;
    other_profile: Profile;
    last_message: string | null;
    last_message_at: string | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data: matches } = await supabase
          .from('matches')
          .select('id, user1_id, user2_id, created_at')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (!matches || matches.length === 0) {
          setConversations([]);
          return;
        }

        const results: typeof conversations = [];
        for (const m of matches) {
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

          if (!convo) continue;

          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (otherProfile) {
            results.push({
              id: convo.id,
              other_profile: otherProfile as Profile,
              last_message: lastMsg?.content || null,
              last_message_at: lastMsg?.created_at || convo.last_message_at || null,
            });
          }
        }

        results.sort((a, b) => {
          if (!a.last_message_at) return 1;
          if (!b.last_message_at) return -1;
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });

        setConversations(results);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Messages</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Messages</h1>
        <div className="bg-card rounded-3xl border border-border/50 p-12 text-center shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">No conversations yet</h2>
          <p className="text-muted-foreground mb-6">When you match with someone, you can start chatting here.</p>
          <Link href="/app/discover" className="inline-flex items-center justify-center rounded-full bg-burgundy-gradient text-white px-6 h-11 text-sm font-medium hover:opacity-90 transition-opacity">
            Go to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">Messages</h1>
      <div className="space-y-2">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/app/messages/${c.id}`}
            className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/50 hover:border-primary/30 hover:shadow-card transition-all"
          >
            {c.other_profile.photos?.[0] ? (
              <Image width={1200} height={800} unoptimized src={c.other_profile.photos[0]} alt={c.other_profile.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-muted-foreground/30" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{c.other_profile.full_name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{c.last_message || 'Say hello!'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
