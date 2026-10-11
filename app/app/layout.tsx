import { auth } from '@clerk/nextjs/server';
import AppLayoutClient from './app-layout-client';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Enforce authentication on the server before protected app content renders.
  await auth.protect({ unauthenticatedUrl: '/login' });

  return <AppLayoutClient>{children}</AppLayoutClient>;
}
