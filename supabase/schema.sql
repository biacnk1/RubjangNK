-- =============================================================================
-- RubjangNK - Main Database Schema
-- รวม migration ทั้งหมด สำหรับ run บน Supabase Cloud Dashboard
-- วันที่: 2026-06-21
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE public.user_role AS ENUM ('customer', 'technician', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. profiles (เชื่อมกับ Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role public.user_role DEFAULT 'customer'::public.user_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. service_categories
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_th TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. technician_applications
CREATE TABLE public.technician_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE RESTRICT NOT NULL,
  location extensions.geography(Point, 4326),
  experience_years INTEGER,
  portfolio_urls TEXT[],
  status public.application_status DEFAULT 'pending'::public.application_status,
  latitude FLOAT8,
  longitude FLOAT8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. technician_profiles (สำหรับช่างที่ approved แล้ว)
CREATE TABLE public.technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  application_id UUID REFERENCES public.technician_applications(id) ON DELETE RESTRICT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_listed BOOLEAN DEFAULT true,
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  latitude FLOAT8,
  longitude FLOAT8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. technician_private_info (ข้อมูลส่วนตัว - เข้าถึงได้แค่ service_role)
CREATE TABLE public.technician_private_info (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT NOT NULL,
  national_id TEXT,
  bank_account TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. chat_rooms
CREATE TABLE public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, technician_id)
);

-- 7. chat_messages
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'quote', 'system')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. job_deals
CREATE TABLE public.job_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_private_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_deals ENABLE ROW LEVEL SECURITY;

-- --- profiles ---
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --- service_categories ---
CREATE POLICY "Service categories are viewable by everyone."
  ON public.service_categories FOR SELECT USING (true);

-- --- technician_applications ---
CREATE POLICY "Users can view their own applications."
  ON public.technician_applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application."
  ON public.technician_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application."
  ON public.technician_applications FOR UPDATE USING (auth.uid() = user_id);

-- --- technician_profiles ---
CREATE POLICY "Technician profiles are viewable by everyone."
  ON public.technician_profiles FOR SELECT USING (true);

-- --- technician_private_info ---
-- ไม่สร้าง policy → เข้าถึงได้แค่ service_role เท่านั้น (admin client)

-- --- chat_rooms ---
CREATE POLICY "Users can view their own chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = technician_id);

CREATE POLICY "Users can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = technician_id);

-- --- chat_messages ---
CREATE POLICY "Users can view messages in their rooms"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND (customer_id = auth.uid() OR technician_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their rooms"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND (customer_id = auth.uid() OR technician_id = auth.uid())
    )
  );

-- --- job_deals ---
CREATE POLICY "Users can view deals in their rooms"
  ON public.job_deals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND (customer_id = auth.uid() OR technician_id = auth.uid())
    )
  );

CREATE POLICY "Technicians can create deals"
  ON public.job_deals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND technician_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update deal status"
  ON public.job_deals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND customer_id = auth.uid()
    )
  );

-- =============================================================================
-- SEED DATA - หมวดหมู่บริการ
-- =============================================================================

INSERT INTO public.service_categories (id, name_th) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ช่างแอร์'),
  ('22222222-2222-2222-2222-222222222222', 'ช่างประปา'),
  ('33333333-3333-3333-3333-333333333333', 'ช่างไฟฟ้า'),
  ('44444444-4444-4444-4444-444444444444', 'ช่างซ่อมบำรุง/ต่อเติม'),
  ('55555555-5555-5555-5555-555555555555', 'แม่บ้าน/ทำความสะอาด')
ON CONFLICT DO NOTHING;
