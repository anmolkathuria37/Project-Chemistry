import { auth } from '@clerk/nextjs/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await auth.protect({ unauthenticatedUrl: '/login' });
  return <>{children}</>;
}
