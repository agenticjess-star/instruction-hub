
-- Instruction groups (top-level use cases like "Tech Lead", "Art Director", etc.)
CREATE TABLE public.instruction_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'layers',
  color text DEFAULT 'primary',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Instruction versions (versioned content within a group)
CREATE TABLE public.instruction_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.instruction_groups(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  content text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  is_production boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Threads (conversation logs linked to groups)
CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.instruction_groups(id) ON DELETE SET NULL,
  title text NOT NULL,
  raw_content text NOT NULL DEFAULT '',
  cleaned_content text NOT NULL DEFAULT '',
  platform text DEFAULT '',
  model text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Thread comments (annotations on threads)
CREATE TABLE public.thread_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger for updated_at on instruction_groups
CREATE TRIGGER update_instruction_groups_updated_at
  BEFORE UPDATE ON public.instruction_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.instruction_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruction_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_comments ENABLE ROW LEVEL SECURITY;

-- RLS: instruction_groups
CREATE POLICY "Users can CRUD own groups" ON public.instruction_groups
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS: instruction_versions (via group ownership)
CREATE POLICY "Users can select own versions" ON public.instruction_versions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.instruction_groups WHERE id = group_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert own versions" ON public.instruction_versions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.instruction_groups WHERE id = group_id AND user_id = auth.uid()));

CREATE POLICY "Users can update own versions" ON public.instruction_versions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.instruction_groups WHERE id = group_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete own versions" ON public.instruction_versions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.instruction_groups WHERE id = group_id AND user_id = auth.uid()));

-- RLS: threads
CREATE POLICY "Users can CRUD own threads" ON public.threads
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS: thread_comments
CREATE POLICY "Users can CRUD own comments" ON public.thread_comments
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments on own threads" ON public.thread_comments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.threads WHERE id = thread_id AND user_id = auth.uid()));
