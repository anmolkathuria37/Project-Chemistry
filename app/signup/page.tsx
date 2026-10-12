'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Heart, CalendarCheck, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const continueToSignup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!dob) { toast.error('Please enter your date of birth.'); return; }
    const birth = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(birth.getTime()) || birth > new Date()) { toast.error('Please enter a valid date of birth.'); return; }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) { toast.error('You must be 18 or older to use Chemistry.'); return; }
    if (age > 100) { toast.error('Please enter a valid date of birth.'); return; }
    sessionStorage.setItem('chemistry_dob', dob);
    setAgeVerified(true);
  };

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, dateOfBirth: dob }),
      });
      const result = await response.json();
      if (!response.ok) { toast.error(result.error || 'Could not create your account.'); return; }
      const login = await signIn('credentials', { email: email.trim().toLowerCase(), password, redirect: false });
      if (login?.error) { toast.success('Account created. Please sign in.'); router.push('/login'); return; }
      sessionStorage.removeItem('chemistry_dob');
      router.push('/onboarding');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-warm-gradient flex flex-col">
      <nav className="h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-burgundy-gradient flex items-center justify-center"><Heart className="w-4 h-4 text-white" fill="white" /></div>
          <span className="font-display text-xl font-bold text-foreground">Chemistry</span>
        </Link>
      </nav>
      <section className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-10">
        {!ageVerified ? (
          <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card p-8 shadow-card">
            <div className="mb-6">
              <CalendarCheck className="mb-4 h-8 w-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">First, a quick check</h1>
              <p className="mt-2 text-muted-foreground">Chemistry is only for adults aged 18 and over. Your date of birth is kept private.</p>
            </div>
            <form onSubmit={continueToSignup} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="dob">Date of birth</Label><Input id="dob" type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setDob(event.target.value)} required /></div>
              <Button className="w-full" type="submit">Continue</Button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-border/50 bg-card p-8 shadow-card">
            <div className="text-center"><h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1><p className="mt-2 text-muted-foreground">Start with Google or use your email.</p></div>
            <button type="button" onClick={() => signIn('google', { callbackUrl: '/onboarding' })} className="w-full rounded-xl border border-border px-4 py-3 flex items-center justify-center gap-2 font-medium hover:bg-muted"><Chrome className="w-5 h-5" /> Continue with Google</button>
            <p className="text-xs text-muted-foreground text-center">After Google sign-in, enter your date of birth in onboarding to confirm you are 18 or older.</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR EMAIL<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={createAccount} className="space-y-4">
              <label className="block space-y-2 text-sm font-medium">Full name<Input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required maxLength={191} /></label>
              <label className="block space-y-2 text-sm font-medium">Email<Input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
              <label className="block space-y-2 text-sm font-medium">Password<Input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></label>
              <p className="text-xs text-muted-foreground">Use at least 8 characters. By creating an account, you confirm you are at least 18.</p>
              <Button className="w-full" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account with email'}</Button>
            </form>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Already have an account? <Link className="underline text-foreground" href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
