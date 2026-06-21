-- Create technician_private_info table for storing sensitive/private data
CREATE TABLE IF NOT EXISTS public.technician_private_info (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT NOT NULL,
  national_id TEXT,
  bank_account TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
-- By enabling RLS and NOT creating any policies, we guarantee that:
-- 1. Insecure client-side queries (Anon Key, User JWT) will be completely blocked.
-- 2. Only the high-privilege service_role client can read or write to this table.
ALTER TABLE public.technician_private_info ENABLE ROW LEVEL SECURITY;
