'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { Heart, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignUpPage() {
  const [dob, setDob] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);

  const continueToSignup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!dob) {
      toast.error('Please enter your date of birth.');
      return;
    }
    const birth = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(birth.getTime()) || birth > new Date()) {
      toast.error('Please enter a valid date of birth.');
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) {
      toast.error('You must be 18 or older to use Chemistry.');
      return;
    }
    if (age > 100) {
      toast.error('Please enter a valid date of birth.');
      return;
    }
    sessionStorage.setItem('chemistry_dob', dob);
    setAgeVerified(true);
  };

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
        {!ageVerified ? (
          <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card p-8 shadow-card">
            <div className="mb-6">
              <CalendarCheck className="mb-4 h-8 w-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">First, a quick check</h1>
              <p className="mt-2 text-muted-foreground">Chemistry is only for adults aged 18 and over. Your date of birth is kept private.</p>
            </div>
            <form onSubmit={continueToSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setDob(event.target.value)} required />
              </div>
              <Button className="w-full" type="submit">Continue</Button>
            </form>
          </div>
        ) : (
          <>
            <div className="text-center max-w-md">
              <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
              <p className="text-muted-foreground mt-2">Meet people who get you. Make the first move.</p>
            </div>
            <SignUp routing="hash" fallbackRedirectUrl="/onboarding" />
            <p className="max-w-sm text-center text-xs text-muted-foreground">By creating an account, you confirm that you are at least 18 years old.</p>
          </>
        )}
        <p className="text-sm text-muted-foreground">Already have an account? <Link className="underline text-foreground" href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
