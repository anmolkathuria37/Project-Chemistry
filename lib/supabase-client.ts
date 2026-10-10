import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  pronouns: string;
  gender: string;
  bio: string;
  date_of_birth: string | null;
  city: string;
  neighborhood: string;
  occupation: string;
  education: string;
  photos: string[];
  profile_completion: number;
  is_verified: boolean;
  verification_badges: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Preferences = {
  id: string;
  user_id: string;
  age_min: number;
  age_max: number;
  distance_km: number;
  looking_for: string;
  interested_in: string[];
  budget_min: number;
  budget_max: number;
};

export type Interest = {
  id: string;
  name: string;
  category: string;
  icon: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  match_id: string;
  created_at: string;
  last_message_at: string | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type Like = {
  id: string;
  liker_id: string;
  liked_id: string;
  is_super_like: boolean;
  intro_note: string;
  created_at: string;
};
