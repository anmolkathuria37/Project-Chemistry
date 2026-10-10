# Supabase → Clerk + MySQL migration plan

## Current state (checked on `main`)

- The Next.js 13 app uses `@supabase/supabase-js` directly from client components.
- `lib/auth-context.tsx` reads Supabase sessions and fetches a profile.
- Login and signup pages use Supabase Auth; signup inserts a profile.
- Feature pages, including matches and the date planner, query Supabase tables directly.
- The merged planner feature expects `saved_date_plans` and a Supabase RLS policy.
- This means a database-only swap is unsafe: auth and every direct database call need a coordinated change.

## Target design

- **Authentication:** Clerk owns registration, login, verification and sessions.
- **Application database:** MySQL, accessed only on the server through Prisma.
- **Identity key:** store the Clerk user ID in `users.id`; do not copy passwords or auth secrets into MySQL.
- **Authorization:** server routes/actions derive the current user from a verified Clerk session. Never trust a browser-supplied user ID.
- **Private data:** authorization checks must cover profile edits, likes, passes, matches, conversations, messages, blocks, reports and saved plans.
- **User lifecycle:** use a verified Clerk webhook (with signature verification and idempotency) to sync user creation, email changes and deletion; also make profile creation safe when a newly authenticated user first reaches the app.

## Phased implementation

### Phase 1 — schema and migration design (this branch)
- Add a Prisma schema for the core relational model.
- Keep the live app's Supabase integration unchanged so this foundation commit does not break the existing app.
- Do not run migrations against any database from this branch.

### Phase 2 — configure services
1. Create a Clerk application and configure allowed redirect URLs.
2. Provision a managed MySQL database with TLS, automated backups and a least-privilege application user.
3. Set server-only `DATABASE_URL`, `CLERK_SECRET_KEY`, and the Clerk publishable key in the deployment environment. Never commit actual secrets.
4. Add and lock Prisma and Clerk dependencies; run `prisma validate` and generate the client.

### Phase 3 — server-side data access
1. Add a singleton Prisma client and typed server-only data-access functions.
2. Add API routes/server actions for profile, preferences, interests, discovery, likes/passes, matches, chat, safety and saved date plans.
3. Enforce authentication and authorization on every write/read; add rate limits, input validation, block checks, and unique/transactional match creation.
4. Add Clerk provider/middleware and migrate login/signup UI to Clerk. Keep an adapter for the current `useAuth` interface only during the transition.

### Phase 4 — migrate screens one feature at a time
Suggested order: auth/profile onboarding → preferences/interests → discovery/likes/passes → matches/conversations/messages → blocks/reports → saved date plans.
- Replace direct browser Supabase queries with server API calls.
- Keep the UI behavior stable and test each feature before moving on.
- Use server-side pagination and avoid N+1 queries in matches and discovery.

### Phase 5 — cutover and cleanup
1. Because this project is starting fresh with demo data, create a fresh MySQL schema rather than importing the Supabase demo rows.
2. Verify signup/login, onboarding, discovery, mutual-like matching, messaging permissions, block/report enforcement, and saved-plan CRUD.
3. Deploy the migration behind a controlled release; retain a rollback commit until smoke tests pass.
4. Only after all Supabase references are removed and the deployed app passes checks, remove `@supabase/supabase-js`, old environment variables, and Supabase migration files.

## Acceptance checklist

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Unauthenticated API requests are rejected.
- [ ] Users cannot read/write another user's private profile data or saved plans.
- [ ] A match cannot be duplicated by reversed user ordering or concurrent requests.
- [ ] A blocked user cannot interact or message.
- [ ] Clerk webhook signatures are verified and webhook handling is idempotent.
- [ ] No secrets are present in git history or client bundles.
- [ ] No active app code imports `@supabase/supabase-js` before cleanup.

## Important notes

- The schema is a starting point, not yet the generated SQL migration. Review it against all existing UI queries before applying it.
- No production or remote database was contacted or changed.
- The app is not fully migrated by this foundation PR; phases 2–5 are still required.
