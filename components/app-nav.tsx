'use client';

import Image from 'next/image';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Heart, Compass, MessageCircle, Calendar, MapPin, Shirt,
  User, Settings, LogOut, Shield, Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  { href: '/app/discover', label: 'Discover', icon: Compass },
  { href: '/app/matches', label: 'Matches', icon: Heart },
  { href: '/app/messages', label: 'Messages', icon: MessageCircle },
  { href: '/app/planner', label: 'Date Planner', icon: Calendar },
  { href: '/app/experiences', label: 'Experiences', icon: MapPin },
  { href: '/app/get-ready', label: 'Get Date Ready', icon: Shirt },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      {/* Desktop top nav */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/app/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-burgundy-gradient flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">Chemistry</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors">
                  {profile?.photos?.[0] ? (
                    <Image width={1200} height={800} unoptimized src={profile.photos[0]} alt="You" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Your Profile'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile?.neighborhood || profile?.city}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/app/profile')}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/app/safety')}>
                  <Shield className="mr-2 h-4 w-4" /> Safety Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/app/settings')}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/90 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors flex-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
