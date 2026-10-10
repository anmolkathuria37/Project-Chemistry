# Clerk + MySQL migration

## Current implementation

The app's authentication provider is Clerk. The application database is MySQL, accessed through Prisma on the server. The old browser-side Supabase SDK has been removed from dependencies; `lib/supabase-client.ts` is a temporary compatibility adapter that sends existing screen queries to the authenticated `/api/data` route.

### Added in this implementation

- Clerk provider, sign-in/sign-up pages, and middleware for protected routes.
- Prisma singleton and committed MySQL schema/migration.
- `GET/PATCH /api/profile` to sync the signed-in Clerk user and read/update their own profile.
- `POST /api/data` adapter for the existing profile, preference, interest, discovery, likes/passes, matches, messaging, safety, and saved-date-plan screens.
- Server-side ownership checks, mutual-like checks for match creation, and block checks for likes and messages.
- Adult age validation on both signup flow and server profile writes; other users' exact birth dates are not returned to clients.
- CI workflow for Prisma validation/generation, TypeScript checks, and a production build.

## Environment

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`

Never commit real credentials. Use separate least-privilege credentials for development and production. Production MySQL should have TLS, backups, and monitoring.

## Local verification

```bash
npm install
npx prisma validate
npx prisma generate
npm run db:migrate
npm run typecheck
npm run build
npm run dev
```

A successful build proves compilation, not live integration. After configuring real Clerk keys and a reachable MySQL database, manually test account creation/sign-in, age gate, onboarding, discovery, reciprocal likes, matches, conversation access, messages, profile and preference edits, block/report actions, and saved date plans.

## Important limitations before production launch

- This GitHub-only workflow cannot configure the user's Clerk dashboard, production MySQL service, domain, or hosting secrets.
- The API adapter preserves the current screen query style during migration. Before handling real users, review authorization and query coverage feature-by-feature and add request rate limiting, abuse monitoring, account deletion/user lifecycle handling, and integration tests against a disposable MySQL database.
- Date suggestions are curated ideas, not live venue availability or confirmed reservations.
- Do not merge/deploy until the latest validation workflow is green and a real environment smoke test passes.
