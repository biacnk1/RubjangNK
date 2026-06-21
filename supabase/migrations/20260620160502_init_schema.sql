-- Enable PostGIS extension for geographical queries
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('customer', 'technician', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- 1. profiles table (links to Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role public.user_role DEFAULT 'customer'::public.user_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. service_categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_th TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. technician_applications table
CREATE TABLE public.technician_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE RESTRICT NOT NULL,
  location geography(Point, 4326),
  experience_years INTEGER,
  portfolio_urls TEXT[],
  status public.application_status DEFAULT 'pending'::public.application_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. technician_profiles table (for approved technicians)
CREATE TABLE public.technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  application_id UUID REFERENCES public.technician_applications(id) ON DELETE RESTRICT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Service Categories RLS
CREATE POLICY "Service categories are viewable by everyone."
  ON public.service_categories FOR SELECT
  USING ( true );

-- Technician Applications RLS
CREATE POLICY "Users can view their own applications."
  ON public.technician_applications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own application."
  ON public.technician_applications FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own application."
  ON public.technician_applications FOR UPDATE
  USING ( auth.uid() = user_id );

-- Technician Profiles RLS
CREATE POLICY "Technician profiles are viewable by everyone."
  ON public.technician_profiles FOR SELECT
  USING ( true );
