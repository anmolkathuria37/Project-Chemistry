import { auth } from '@clerk/nextjs/server';
import AppLayoutClient from './app-layout-client';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Verify the session before protected app content is rendered.
  await auth.protect({ unauthenticatedUrl: '/login' });
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
