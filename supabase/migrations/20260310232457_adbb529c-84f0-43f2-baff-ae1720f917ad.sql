
-- Categories table (parent of instruction_groups)
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own categories"
  ON public.categories FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add category_id to instruction_groups
ALTER TABLE public.instruction_groups ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add color to instruction_groups if not rich enough
ALTER TABLE public.instruction_groups ALTER COLUMN color SET DEFAULT '#10b981';

-- Trigger for updated_at on categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
