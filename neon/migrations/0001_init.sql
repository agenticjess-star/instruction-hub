-- ============================================================================
-- Instruction OS — Neon schema (consolidated from the 7 Supabase migrations)
-- Adapted: auth.users -> neon_auth.user ; auth.uid() -> auth.uid()
-- Note: the Neon Data API provides auth.user_id() (returns text). We compare
-- against uuid user ids via a cast.
-- ============================================================================

-- ── Helper: updated_at trigger function ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  telegram_chat_id BIGINT,
  telegram_link_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_chat_id_key
  ON public.profiles(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_link_code_key
  ON public.profiles(telegram_link_code) WHERE telegram_link_code IS NOT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Categories (top-level grouping of instruction groups) ───────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own categories" ON public.categories;
CREATE POLICY "Users can CRUD own categories" ON public.categories
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Instruction groups (personas: Tech Lead, Art Director, ...) ─────────────
CREATE TABLE IF NOT EXISTS public.instruction_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'layers',
  color TEXT DEFAULT '#10b981',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instruction_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own groups" ON public.instruction_groups;
CREATE POLICY "Users can CRUD own groups" ON public.instruction_groups
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_instruction_groups_updated_at ON public.instruction_groups;
CREATE TRIGGER update_instruction_groups_updated_at
  BEFORE UPDATE ON public.instruction_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Instruction versions (versioned content, one production per group) ──────
CREATE TABLE IF NOT EXISTS public.instruction_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.instruction_groups(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  is_production BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instruction_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can select own versions" ON public.instruction_versions;
CREATE POLICY "Users can select own versions" ON public.instruction_versions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.instruction_groups g WHERE g.id = group_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own versions" ON public.instruction_versions;
CREATE POLICY "Users can insert own versions" ON public.instruction_versions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.instruction_groups g WHERE g.id = group_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can update own versions" ON public.instruction_versions;
CREATE POLICY "Users can update own versions" ON public.instruction_versions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.instruction_groups g WHERE g.id = group_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can delete own versions" ON public.instruction_versions;
CREATE POLICY "Users can delete own versions" ON public.instruction_versions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.instruction_groups g WHERE g.id = group_id AND g.user_id = auth.uid()));

-- ── Threads (conversation logs, linked to groups, rated) ────────────────────
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.instruction_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  raw_content TEXT NOT NULL DEFAULT '',
  cleaned_content TEXT NOT NULL DEFAULT '',
  platform TEXT DEFAULT '',
  model TEXT DEFAULT '',
  rating TEXT CHECK (rating IN ('positive', 'neutral', 'negative')) DEFAULT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own threads" ON public.threads;
CREATE POLICY "Users can CRUD own threads" ON public.threads
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Thread comments (annotations on threads / messages) ─────────────────────
CREATE TABLE IF NOT EXISTS public.thread_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  message_index INTEGER,
  quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.thread_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own comments" ON public.thread_comments;
CREATE POLICY "Users can CRUD own comments" ON public.thread_comments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view comments on own threads" ON public.thread_comments;
CREATE POLICY "Users can view comments on own threads" ON public.thread_comments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
