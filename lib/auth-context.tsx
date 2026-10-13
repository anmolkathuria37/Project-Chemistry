'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import type { Profile } from '@/lib/supabase-client';

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
};

type AuthContextType = {
  user: AppUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const pendingDob = sessionStorage.getItem('chemistry_dob');
      if (pendingDob) {
        const dobResponse = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ date_of_birth: pendingDob }),
        });
        if (dobResponse.ok) sessionStorage.removeItem('chemistry_dob');
      }
      const response = await fetch('/api/profile', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load profile');
      setProfile(result.data as Profile);
    } catch (error) {
      console.error('Profile load failed:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    void refreshProfile();
  }, [status, session?.user?.id, refreshProfile]);

  const user = useMemo<AppUser | null>(() => {
    const authUser = session?.user;
    if (!authUser?.id) return null;
    const name = authUser.name ?? null;
    const parts = name?.trim().split(/\s+/) ?? [];
    return {
      id: authUser.id,
      email: authUser.email ?? null,
      name,
      firstName: parts[0] || null,
      lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
      primaryEmailAddress: authUser.email ? { emailAddress: authUser.email } : null,
    };
  }, [session?.user]);

  const value: AuthContextType = {
    user,
    profile,
    loading: status === 'loading' || (!!user && profileLoading),
    signOut: async () => { await nextAuthSignOut({ callbackUrl: '/' }); },
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
