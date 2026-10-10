'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import type { Profile, Message as MessageType } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Shield, MoreVertical, Calendar, Sparkles, Ban, Flag } from 'lucide-react';
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

const ICEBREAKERS = [
  'What\'s your favorite café in the city?',
  'If you could plan the perfect first date, what would it be?',
  'What\'s something you\'re passionate about?',
  'Any weekend plans you\'re excited about?',
];

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) return;
    try {
      // Get conversation and match
      const { data: convo } = await supabase
        .from('conversations')
        .select('match_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!convo) {
        router.push('/app/messages');
        return;
      }

      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', convo.match_id)
        .maybeSingle();

      if (!match) {
        router.push('/app/messages');
        return;
      }

      const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .maybeSingle();

      if (profile) setOtherProfile(profile as Profile);

      // Check if blocked
      const { data: blockCheck } = await supabase
        .from('blocks')
        .select('id')
        .or(`blocker_id.eq.${user.id}.and.blocked_id.eq.${otherId},blocker_id.eq.${otherId}.and.blocked_id.eq.${user.id}`)
        .maybeSingle();

      if (blockCheck) {
        router.push('/app/messages');
        return;
      }

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgs) setMessages(msgs as unknown as MessageType[]);

      // Mark messages from other as read
      if (msgs) {
        const unread = msgs.filter((m) => m.sender_id !== user.id && !m.read_at);
        if (unread.length > 0) {
          for (const m of unread) {
            await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', m.id);
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, conversationId, router]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || !conversationId) return;
    setSending(true);
    const content = input.trim();
    setInput('');

    try {
      const { data: newMsg } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (newMsg) {
        setMessages((prev) => [...prev, newMsg as unknown as MessageType]);
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } catch {
      toast.error('Failed to send message.');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleIcebreaker = (text: string) => {
    setInput(text);
  };

  const handleBlock = async () => {
    if (!user || !otherProfile) return;
    try {
      await supabase.from('blocks').insert({
        blocker_id: user.id,
        blocked_id: otherProfile.id,
      });
      toast.success(`Blocked ${otherProfile.full_name}.`);
      setShowBlockDialog(false);
      router.push('/app/messages');
    } catch {
      toast.error('Could not block this user.');
    }
  };

  const handleReport = async () => {
    if (!user || !otherProfile || !reportReason) return;
    try {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: otherProfile.id,
        reason: reportReason,
      });
      toast.success('Report submitted. Our team will review it.');
      setShowReportDialog(false);
      setReportReason('');
    } catch {
      toast.error('Could not submit report.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="h-16 rounded-2xl shimmer mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl shimmer" style={{ width: `${50 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!otherProfile) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8 text-center">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Link href="/app/messages" className="text-primary hover:underline mt-2 inline-block">Back to messages</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link href="/app/messages" className="md:hidden">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          {otherProfile.photos?.[0] ? (
            <img src={otherProfile.photos[0]} alt={otherProfile.full_name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Shield className="w-4 h-4 text-muted-foreground/30" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm text-foreground">{otherProfile.full_name}</p>
              {otherProfile.is_verified && <Shield className="w-3.5 h-3.5 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">{otherProfile.neighborhood || otherProfile.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/app/planner')}>
            <Calendar className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive">
                <Ban className="mr-2 h-4 w-4" /> Block User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-destructive">
                <Flag className="mr-2 h-4 w-4" /> Report User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold text-foreground mb-1">You matched with {otherProfile.full_name}!</p>
            <p className="text-sm text-muted-foreground mb-6">Start the conversation with an icebreaker:</p>
            <div className="space-y-2 max-w-sm mx-auto">
              {ICEBREAKERS.map((ice) => (
                <button
                  key={ice}
                  onClick={() => handleIcebreaker(ice)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors"
                >
                  {ice}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-burgundy-gradient text-white rounded-br-md'
                      : 'bg-secondary text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 pt-3 pb-4 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Type a message..."
          className="rounded-full flex-1"
          disabled={sending}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          size="icon"
          className="rounded-full bg-burgundy-gradient hover:opacity-90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Block dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {otherProfile.full_name}?</DialogTitle>
            <DialogDescription>
              They won't be able to see your profile or send you messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBlock}>Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {otherProfile.full_name}</DialogTitle>
            <DialogDescription>
              Help us keep Chemistry safe. Tell us what happened.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {['Inappropriate messages', 'Fake or spam profile', 'Harassment or threats', 'Underage user', 'Other'].map((reason) => (
              <button
                key={reason}
                onClick={() => setReportReason(reason)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  reportReason === reason
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReport} disabled={!reportReason}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
