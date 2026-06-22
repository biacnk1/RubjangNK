ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS last_notified_at timestamptz;
