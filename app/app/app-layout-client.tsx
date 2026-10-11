'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AppNav } from '@/components/app-nav';
import { Heart } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && profile && !profile.onboarding_completed) {
      router.push('/onboarding');
    }
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-burgundy-gradient flex items-center justify-center animate-pulse">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (profile && !profile.onboarding_completed)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-gradient">
      <AppNav />
      <main className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
