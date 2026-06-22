-- =============================================================================
-- Part 5: Reviews table + rating trigger
-- Part 3.2: Chat read status for unread count
-- Part 4: ID verification status on technician_profiles
-- =============================================================================

-- 1. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_profile_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique
  ON public.reviews(technician_profile_id, reviewer_id);

-- 2. chat_read_status
CREATE TABLE IF NOT EXISTS public.chat_read_status (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, room_id)
);

-- 3. verification status column
ALTER TABLE public.technician_profiles
  ADD COLUMN IF NOT EXISTS id_verification_status TEXT
  DEFAULT NULL
  CHECK (id_verification_status IN ('pending', 'approved', 'rejected'));

-- =============================================================================
-- Rating aggregation trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_rating_avg()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_id := OLD.technician_profile_id;
  ELSE
    target_id := NEW.technician_profile_id;
  END IF;

  UPDATE public.technician_profiles
  SET rating_avg = COALESCE(
        (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE technician_profile_id = target_id),
        0),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE technician_profile_id = target_id)
  WHERE id = target_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_rating ON public.reviews;
CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_rating_avg();

-- =============================================================================
-- RLS Policies
-- =============================================================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_read_status ENABLE ROW LEVEL SECURITY;

-- reviews: everyone can read
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

-- reviews: authenticated users can insert their own
DROP POLICY IF EXISTS "Users can insert their own review" ON public.reviews;
CREATE POLICY "Users can insert their own review"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- chat_read_status: users can manage their own
DROP POLICY IF EXISTS "Users can view own read status" ON public.chat_read_status;
CREATE POLICY "Users can view own read status"
  ON public.chat_read_status FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own read status" ON public.chat_read_status;
CREATE POLICY "Users can upsert own read status"
  ON public.chat_read_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own read status" ON public.chat_read_status;
CREATE POLICY "Users can update own read status"
  ON public.chat_read_status FOR UPDATE
  USING (auth.uid() = user_id);

-- technician_applications: public read for profile page
DROP POLICY IF EXISTS "Technician applications viewable by everyone" ON public.technician_applications;
CREATE POLICY "Technician applications viewable by everyone"
  ON public.technician_applications FOR SELECT USING (true);
