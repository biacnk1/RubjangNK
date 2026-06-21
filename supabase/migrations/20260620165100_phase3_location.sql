-- Add latitude and longitude to technician_applications and technician_profiles
ALTER TABLE public.technician_applications
ADD COLUMN latitude float8,
ADD COLUMN longitude float8;

ALTER TABLE public.technician_profiles
ADD COLUMN latitude float8,
ADD COLUMN longitude float8;
