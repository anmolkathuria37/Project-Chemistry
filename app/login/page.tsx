'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Heart, Mail, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: '/app/discover',
      });
      if (result?.error) setError('Email or password is incorrect.');
      else window.location.assign(result?.url || '/app/discover');
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-warm-gradient flex flex-col">
      <nav className="h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-burgundy-gradient flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Chemistry</span>
        </Link>
      </nav>
      <section className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-10">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue your journey.</p>
        </div>
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-border/50 bg-card p-8 shadow-card">
          <button type="button" onClick={() => signIn('google', { callbackUrl: '/onboarding' })} className="w-full rounded-xl border border-border px-4 py-3 flex items-center justify-center gap-2 font-medium hover:bg-muted">
            <Chrome className="w-5 h-5" /> Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR EMAIL<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={handleCredentials} className="space-y-4">
            <label className="block space-y-2 text-sm font-medium">Email
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-3 font-normal" />
            </label>
            <label className="block space-y-2 text-sm font-medium">Password
              <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-3 font-normal" />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-burgundy-gradient px-4 py-3 font-semibold text-white disabled:opacity-60" type="submit">
              {busy ? 'Signing in…' : <><Mail className="mr-2 inline h-4 w-4" /> Sign in with email</>}
            </button>
          </form>
        </div>
        <p className="text-sm text-muted-foreground">New to Chemistry? <Link className="underline text-foreground" href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
