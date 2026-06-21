-- Relax FK constraint for local MVP testing with mock data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
