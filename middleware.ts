import { clerkMiddleware } from '@clerk/nextjs/server';

// Keep Clerk's request/session middleware active. Route authorization is
// enforced in server layouts and API handlers to avoid Edge-runtime failures.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
