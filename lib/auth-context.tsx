'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import type { Profile } from '@/lib/supabase-client';

type AuthContextType = {
  user: { id: string; firstName?: string | null; lastName?: string | null; primaryEmailAddress?: { emailAddress: string } | null } | null;
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
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const refreshProfile = async () => {
    if (!clerkUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    try {
      const pendingDob = sessionStorage.getItem('chemistry_dob');
      if (pendingDob) {
        const dobResponse = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ date_of_birth: pendingDob }) });
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
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    void refreshProfile();
  }, [isLoaded, clerkUser?.id]);

  const user = useMemo(() => clerkUser ? ({
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    primaryEmailAddress: clerkUser.primaryEmailAddress ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress } : null,
  }) : null, [clerkUser]);

  const value: AuthContextType = {
    user,
    profile,
    loading: !isLoaded || (!!clerkUser && profileLoading),
    signOut: async () => { await clerkSignOut({ redirectUrl: '/' }); },
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
