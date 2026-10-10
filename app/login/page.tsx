'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Heart } from 'lucide-react';

export default function LoginPage() {
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
        <SignIn routing="hash" />
        <p className="text-sm text-muted-foreground">New to Chemistry? <Link className="underline text-foreground" href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
