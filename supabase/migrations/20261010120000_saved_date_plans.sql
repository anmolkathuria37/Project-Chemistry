-- Saved date ideas are private to each signed-in user.
CREATE TABLE IF NOT EXISTS public.saved_date_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  neighborhood text NOT NULL DEFAULT '',
  budget_label text NOT NULL DEFAULT '',
  preferred_date date,
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_date_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_date_plans_select_own" ON public.saved_date_plans;
CREATE POLICY "saved_date_plans_select_own"
  ON public.saved_date_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_date_plans_insert_own" ON public.saved_date_plans;
CREATE POLICY "saved_date_plans_insert_own"
  ON public.saved_date_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_date_plans_delete_own" ON public.saved_date_plans;
CREATE POLICY "saved_date_plans_delete_own"
  ON public.saved_date_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_date_plans_user_created
  ON public.saved_date_plans(user_id, created_at DESC);
