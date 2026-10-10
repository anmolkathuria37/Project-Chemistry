/*
# Project Chemistry — Core Schema (Milestone 1)

Creates the foundational database schema for a dating and lifestyle platform.

## Overview
This migration establishes the core tables needed for Milestone 1: user profiles,
preferences, interests, discovery (likes/passes), matches, conversations, messages,
blocks, and reports. All tables use UUIDs and have Row Level Security enabled.

## New Tables
1. **profiles** — Extended user profile data (linked to auth.users)
   - id (uuid, PK, references auth.users)
   - full_name, pronouns, gender, bio, date_of_birth
   - city, neighborhood, occupation, education
   - photos (jsonb array of photo URLs)
   - profile_completion percentage
   - is_verified, verification_badges
   - created_at, updated_at

2. **preferences** — Dating preferences per user
   - user_id (FK profiles)
   - age_min, age_max, distance_km
   - looking_for (enum: serious, casual, friendship, exploring)
   - interested_in (jsonb array of genders)
   - budget_min, budget_max

3. **interests** — Master list of interests/hobbies
   - id, name, category, icon

4. **user_interests** — Maps users to interests
   - user_id, interest_id

5. **likes** — Discovery likes (one user likes another)
   - id, liker_id, liked_id, is_super_like, created_at
   - Unique constraint prevents duplicate likes

6. **passes** — Discovery passes (one user passes on another)
   - id, passer_id, passed_id, created_at
   - Unique constraint prevents duplicate passes

7. **matches** — Mutual matches (both users liked each other)
   - id, user1_id, user2_id, created_at
   - Unique constraint prevents duplicate matches

8. **conversations** — Chat threads between matched users
   - id, match_id, created_at, last_message_at

9. **messages** — Individual messages in conversations
   - id, conversation_id, sender_id, content, created_at, read_at

10. **blocks** — User blocks
    - id, blocker_id, blocked_id, created_at

11. **reports** — User reports for moderation
    - id, reporter_id, reported_id, reason, details, status, created_at

## Security
- RLS enabled on all tables.
- Policies enforce that authenticated users can only access their own data,
  or data they are party to (matches, conversations, messages).
- Match/conversation/message access is scoped to participants.
- Blocks and reports are scoped to the reporter/blocker.
- Profiles are readable by all authenticated users (for discovery), but
  editable only by the owner.
*/

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  pronouns text DEFAULT '',
  gender text DEFAULT '',
  bio text DEFAULT '',
  date_of_birth date,
  city text DEFAULT 'Delhi NCR',
  neighborhood text DEFAULT '',
  occupation text DEFAULT '',
  education text DEFAULT '',
  photos jsonb DEFAULT '[]'::jsonb,
  profile_completion int DEFAULT 0,
  is_verified boolean DEFAULT false,
  verification_badges jsonb DEFAULT '[]'::jsonb,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON profiles;
CREATE POLICY "profiles_select_all_authenticated"
  ON profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  age_min int DEFAULT 18,
  age_max int DEFAULT 45,
  distance_km int DEFAULT 25,
  looking_for text DEFAULT 'exploring',
  interested_in jsonb DEFAULT '[]'::jsonb,
  budget_min int DEFAULT 500,
  budget_max int DEFAULT 3000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preferences_select_own" ON preferences;
CREATE POLICY "preferences_select_own"
  ON preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_insert_own" ON preferences;
CREATE POLICY "preferences_insert_own"
  ON preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_update_own" ON preferences;
CREATE POLICY "preferences_update_own"
  ON preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_delete_own" ON preferences;
CREATE POLICY "preferences_delete_own"
  ON preferences FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- INTERESTS (master list)
-- ============================================================
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  icon text DEFAULT '',
  UNIQUE(name)
);

ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interests_select_all" ON interests;
CREATE POLICY "interests_select_all"
  ON interests FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "interests_insert_own" ON interests;
CREATE POLICY "interests_insert_own"
  ON interests FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- USER_INTERESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id uuid NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_interests_select_own" ON user_interests;
CREATE POLICY "user_interests_select_own"
  ON user_interests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_interests_insert_own" ON user_interests;
CREATE POLICY "user_interests_insert_own"
  ON user_interests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_interests_delete_own" ON user_interests;
CREATE POLICY "user_interests_delete_own"
  ON user_interests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  liked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_super_like boolean DEFAULT false,
  intro_note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(liker_id, liked_id),
  CHECK (liker_id != liked_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select_own" ON likes;
CREATE POLICY "likes_select_own"
  ON likes FOR SELECT TO authenticated
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = liker_id);

DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own"
  ON likes FOR DELETE TO authenticated
  USING (auth.uid() = liker_id);

-- ============================================================
-- PASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  passed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(passer_id, passed_id),
  CHECK (passer_id != passed_id)
);

ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "passes_select_own" ON passes;
CREATE POLICY "passes_select_own"
  ON passes FOR SELECT TO authenticated
  USING (auth.uid() = passer_id);

DROP POLICY IF EXISTS "passes_insert_own" ON passes;
CREATE POLICY "passes_insert_own"
  ON passes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = passer_id);

DROP POLICY IF EXISTS "passes_delete_own" ON passes;
CREATE POLICY "passes_delete_own"
  ON passes FOR DELETE TO authenticated
  USING (auth.uid() = passer_id);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_participants" ON matches;
CREATE POLICY "matches_select_participants"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "matches_insert_participants" ON matches;
CREATE POLICY "matches_insert_participants"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "matches_delete_participants" ON matches;
CREATE POLICY "matches_delete_participants"
  ON matches FOR DELETE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select_participants" ON conversations;
CREATE POLICY "conversations_select_participants"
  ON conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = conversations.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "conversations_insert_participants" ON conversations;
CREATE POLICY "conversations_insert_participants"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = conversations.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "conversations_update_participants" ON conversations;
CREATE POLICY "conversations_update_participants"
  ON conversations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = conversations.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_participants" ON messages;
CREATE POLICY "messages_select_participants"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN matches m ON m.id = c.match_id
      WHERE c.id = messages.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_participants" ON messages;
CREATE POLICY "messages_insert_participants"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN matches m ON m.id = c.match_id
      WHERE c.id = messages.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND messages.sender_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_update_participants" ON messages;
CREATE POLICY "messages_update_participants"
  ON messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN matches m ON m.id = c.match_id
      WHERE c.id = messages.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- ============================================================
-- BLOCKS
-- ============================================================
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_select_own" ON blocks;
CREATE POLICY "blocks_select_own"
  ON blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_insert_own" ON blocks;
CREATE POLICY "blocks_insert_own"
  ON blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_delete_own" ON blocks;
CREATE POLICY "blocks_delete_own"
  ON blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own" ON reports;
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_likes_liker ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked ON likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_passes_passer ON passes(passer_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_match ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- ============================================================
-- TRIGGER: updated_at on profiles
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS preferences_updated_at ON preferences;
CREATE TRIGGER preferences_updated_at BEFORE UPDATE ON preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
