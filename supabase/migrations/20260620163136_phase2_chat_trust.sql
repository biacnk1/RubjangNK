-- Update technician_profiles for Trust Layer
ALTER TABLE public.technician_profiles 
ADD COLUMN is_listed boolean DEFAULT true;

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  technician_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, technician_id) -- One active chat room per pair
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'quote', 'system')),
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_deals table
CREATE TABLE public.job_deals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Row Level Security (RLS) policies for Phase 2

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_deals ENABLE ROW LEVEL SECURITY;

-- Chat Rooms: users can read and insert if they are either customer or technician
CREATE POLICY "Users can view their own chat rooms" 
ON public.chat_rooms FOR SELECT 
USING (auth.uid() = customer_id OR auth.uid() = technician_id);

CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms FOR INSERT 
WITH CHECK (auth.uid() = customer_id OR auth.uid() = technician_id);

-- Chat Messages: users can read messages in their rooms
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

-- Job Deals: users can view and update deals in their rooms
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
