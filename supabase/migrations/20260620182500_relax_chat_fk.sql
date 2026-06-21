ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_customer_id_fkey;
ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_technician_id_fkey;

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
