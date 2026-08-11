ALTER TABLE public.thread_comments
  ADD COLUMN IF NOT EXISTS message_index integer,
  ADD COLUMN IF NOT EXISTS quote text;