
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT,
  ADD COLUMN IF NOT EXISTS telegram_link_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_chat_id_key ON public.profiles(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_link_code_key ON public.profiles(telegram_link_code) WHERE telegram_link_code IS NOT NULL;

ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
