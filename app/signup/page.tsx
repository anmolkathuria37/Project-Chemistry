'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowLeft, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'age'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setStep('age');
  };

  const calculateAge = (dateStr: string) => {
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      toast.error('Please enter your date of birth.');
      return;
    }
    const age = calculateAge(dob);
    if (age < 18) {
      toast.error('You must be 18 or older to use Chemistry.');
      return;
    }
    if (age > 100) {
      toast.error('Please enter a valid date of birth.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { date_of_birth: dob, age },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Try signing in.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          date_of_birth: dob,
        });

        if (profileError && !profileError.message.includes('duplicate')) {
          console.error('Profile creation error:', profileError);
        }

        toast.success('Account created! Let\'s set up your profile.');
        router.push('/onboarding');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col">
      <nav className="h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-burgundy-gradient flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Chemistry</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-card border border-border/50 p-8 animate-scale-in">
            {step === 'credentials' ? (
              <>
                <div className="mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
                  <p className="text-muted-foreground mt-2">Start your journey toward meaningful connections.</p>
                </div>
                <form onSubmit={handleCredentials} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 bg-burgundy-gradient hover:opacity-90">
                    Continue
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep('credentials')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-foreground">Verify your age</h1>
                  <p className="text-muted-foreground mt-2">Chemistry is for adults 18 and above only.</p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  {dob && calculateAge(dob) >= 18 && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                      <Check className="w-4 h-4" />
                      You are {calculateAge(dob)} years old — you're eligible!
                    </div>
                  )}
                  {dob && calculateAge(dob) < 18 && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                      You must be 18 or older to use Chemistry.
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={loading || (dob ? calculateAge(dob) < 18 : true)}
                    className="w-full rounded-xl h-11 bg-burgundy-gradient hover:opacity-90"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-6 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
