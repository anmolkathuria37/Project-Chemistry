# Auth.js + Google OAuth + MySQL migration

## Current implementation

Project Chemistry uses Auth.js (NextAuth.js v4) with Google OAuth and email/password credentials. Prisma stores user identity, OAuth account links, and dating-profile data in MySQL. Passwords are hashed with bcrypt before they are stored. JWT sessions are verified server-side by protected-page middleware and API route handlers.

### Included in this migration

- Google sign-in using the standard Auth.js Google provider.
- Email/password registration and sign-in with server-side adult-age validation and bcrypt password hashes.
- Prisma models and MySQL migration for Auth.js user fields, OAuth accounts, sessions, and verification tokens.
- A shared Auth.js configuration and typed session user ID.
- Server-side session checks for profile, data, uploads, and admin APIs.
- Existing profile, preference, discovery, match, messaging, safety, and saved-date-plan data models retained.

## Environment

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAILS`

For Google OAuth, reuse the Google OAuth client ID already used by Smokey Tales (it is prefilled in `.env.example`). In Google Cloud Console, retrieve its client secret and add `http://localhost:3000/api/auth/callback/google` plus `https://YOUR_DOMAIN/api/auth/callback/google` to its authorized redirect URIs. Keep the client secret in `.env.local`/Vercel environment variables only; never commit it.

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

A successful build proves compilation, not live provider/database integration. Test Google sign-in, email registration, wrong-password rejection, the 18+ server-side age gate, onboarding, discovery, reciprocal likes, matches, conversation access, messages, profile and preference edits, block/report actions, saved date plans, and admin allowlist checks against a disposable MySQL database.

## Production checklist

- Configure Google OAuth redirect URIs and production environment variables.
- Use a managed MySQL database with TLS, backups, and least-privilege credentials.
- Run the committed Prisma migrations before serving traffic.
- Verify authentication and authorization end-to-end before merging/deploying.
- Before real users, add email verification/password reset, rate limiting, abuse monitoring, account deletion/lifecycle handling, and automated integration tests.
- Date suggestions are curated ideas, not live venue availability or confirmed reservations.
