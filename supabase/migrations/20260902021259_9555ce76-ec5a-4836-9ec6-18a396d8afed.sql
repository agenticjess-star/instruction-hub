-- ── user_settings ──
CREATE TABLE public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gemini_api_key text,
  supabase_project_url text,
  telegram_bot_token text,
  telegram_bot_username text,
  telegram_webhook_secret text UNIQUE,
  telegram_chat_id bigint,
  telegram_linked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── activity_events ──
CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  source text NOT NULL DEFAULT 'web',
  title text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.instruction_groups(id) ON DELETE SET NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activity" ON public.activity_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX activity_events_user_created_idx ON public.activity_events (user_id, created_at DESC);
CREATE INDEX activity_events_unread_idx ON public.activity_events (user_id) WHERE read_at IS NULL;

-- ── activity logging triggers ──
CREATE OR REPLACE FUNCTION public.log_thread_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_events (user_id, kind, source, title, detail, thread_id, group_id)
  VALUES (
    NEW.user_id,
    'thread',
    COALESCE(NULLIF(NEW.source, ''), 'web'),
    NEW.title,
    CASE WHEN NEW.group_id IS NULL THEN 'Unsorted thread' ELSE 'Thread linked to an instruction' END,
    NEW.id,
    NEW.group_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_thread_activity_trigger
  AFTER INSERT ON public.threads
  FOR EACH ROW EXECUTE FUNCTION public.log_thread_activity();

CREATE OR REPLACE FUNCTION public.log_comment_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t_title text;
  t_group uuid;
BEGIN
  SELECT title, group_id INTO t_title, t_group FROM public.threads WHERE id = NEW.thread_id;
  INSERT INTO public.activity_events (user_id, kind, source, title, detail, thread_id, group_id)
  VALUES (
    NEW.user_id,
    CASE WHEN NEW.message_index IS NULL THEN 'note' ELSE 'annotation' END,
    'web',
    COALESCE(t_title, 'Thread'),
    left(NEW.content, 280),
    NEW.thread_id,
    t_group
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_comment_activity_trigger
  AFTER INSERT ON public.thread_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_comment_activity();

CREATE OR REPLACE FUNCTION public.log_version_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g_user uuid;
  g_name text;
BEGIN
  IF NEW.is_production IS NOT TRUE OR (TG_OP = 'UPDATE' AND OLD.is_production IS TRUE) THEN
    RETURN NEW;
  END IF;
  SELECT user_id, name INTO g_user, g_name FROM public.instruction_groups WHERE id = NEW.group_id;
  IF g_user IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.activity_events (user_id, kind, source, title, detail, group_id)
  VALUES (g_user, 'promotion', 'web', g_name, 'Version ' || NEW.version_number || ' promoted to production', NEW.group_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_version_promotion_trigger
  AFTER INSERT OR UPDATE OF is_production ON public.instruction_versions
  FOR EACH ROW EXECUTE FUNCTION public.log_version_activity();

REVOKE EXECUTE ON FUNCTION public.log_thread_activity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_comment_activity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_version_activity() FROM PUBLIC, anon, authenticated;

-- ── cleanup / performance ──
ALTER TABLE public.profiles DROP COLUMN IF EXISTS telegram_chat_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS telegram_link_code;

CREATE INDEX IF NOT EXISTS threads_user_created_idx ON public.threads (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS threads_group_idx ON public.threads (group_id);
CREATE INDEX IF NOT EXISTS thread_comments_thread_idx ON public.thread_comments (thread_id);
CREATE INDEX IF NOT EXISTS instruction_versions_group_idx ON public.instruction_versions (group_id, version_number DESC);
CREATE INDEX IF NOT EXISTS instruction_groups_user_category_idx ON public.instruction_groups (user_id, category_id);
CREATE INDEX IF NOT EXISTS categories_user_idx ON public.categories (user_id);