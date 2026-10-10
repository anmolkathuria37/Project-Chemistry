# Project Chemistry

Dating that leads somewhere. Project Chemistry is a Next.js app for adult users to discover profiles, like/pass, match, message, maintain profile preferences, and save date ideas.

## Stack

- Next.js 13 App Router, React, TypeScript, Tailwind CSS
- Clerk for sign-up, sign-in, and session management
- MySQL with Prisma for server-side relational data access
- Sonner for UI feedback

The browser no longer connects directly to MySQL. Authenticated requests go through Next.js route handlers, which derive the acting user from the verified Clerk session.

## Local setup

### 1. Requirements

- Node.js 20+
- MySQL 8+
- A Clerk application (development instance is fine)

### 2. Create the local databases

Create a main database and a separate shadow database in MySQL. For example:

```sql
CREATE DATABASE project_chemistry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE project_chemistry_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'chemistry_app'@'localhost' IDENTIFIED BY 'replace-with-a-strong-password';
GRANT ALL PRIVILEGES ON project_chemistry.* TO 'chemistry_app'@'localhost';
GRANT ALL PRIVILEGES ON project_chemistry_shadow.* TO 'chemistry_app'@'localhost';
FLUSH PRIVILEGES;
```

Use a unique local password. Do not commit it to Git.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your own values:

- `DATABASE_URL`: application database connection string
- `SHADOW_DATABASE_URL`: separate shadow database connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key (server-side only)
- `NEXT_PUBLIC_APP_URL`: local or deployed app URL

Get Clerk keys from the Clerk Dashboard. Keep `CLERK_SECRET_KEY` and database credentials private. Never paste real values into issues or commit them.

### 4. Install, migrate, and run

```bash
npm install
npx prisma validate
npx prisma generate
npm run db:migrate
npm run dev
```

Open http://localhost:3000. The first authenticated request creates the matching application user row. The interest catalog is seeded by the server on first interest lookup.

## Deployment

1. Provision a managed MySQL database with TLS and backups.
2. Create a Clerk production instance and set its allowed origins/redirect URLs to your deployed domain.
3. Add the environment variables from `.env.example` to your hosting provider. Use production credentials, never the local placeholders.
4. Deploy with Node.js 20+ and run `npm install`, `npx prisma generate`, and `npm run db:migrate` as part of the release.
5. Confirm the validation workflow passes, then smoke-test signup, sign-in, onboarding, discovery, mutual likes, messaging, profile edits, preferences, safety actions, and saved date plans.

Do not expose `DATABASE_URL` or `CLERK_SECRET_KEY` as `NEXT_PUBLIC_*` variables.

## Data and safety notes

- Clerk owns credentials and sessions; MySQL stores application profile and dating data.
- The user ID in MySQL is the Clerk user ID.
- Server routes reject unauthenticated requests and apply ownership checks for profile writes, preferences, likes, passes, matches, conversations, messages, blocks, reports, and saved plans.
- The app is for adults 18+. The signup screen checks date of birth and the server validates it again before storing it.
- Date-planner venue suggestions are curated ideas, not live venue availability or confirmed bookings.
- This repository cannot include your Clerk keys, production database, DNS, hosting account, or deployment secrets. Those must be configured in your own accounts before a production launch.

## Useful commands

- `npm run dev` — local development
- `npm run typecheck` — TypeScript checks
- `npm run lint` — Next.js lint
- `npx prisma validate` — validate the Prisma schema
- `npx prisma generate` — regenerate the Prisma client
- `npm run db:migrate` — apply committed Prisma migrations
