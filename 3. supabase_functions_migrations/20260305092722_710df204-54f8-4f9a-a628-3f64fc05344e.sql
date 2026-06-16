
-- Add secondary_email to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS secondary_email text DEFAULT '';

-- Add school-related fields to sub_profiles
ALTER TABLE public.sub_profiles ADD COLUMN IF NOT EXISTS school_name text DEFAULT '';
ALTER TABLE public.sub_profiles ADD COLUMN IF NOT EXISTS school_address text DEFAULT '';
ALTER TABLE public.sub_profiles ADD COLUMN IF NOT EXISTS school_telephone text DEFAULT '';
ALTER TABLE public.sub_profiles ADD COLUMN IF NOT EXISTS grade text DEFAULT '';
ALTER TABLE public.sub_profiles ADD COLUMN IF NOT EXISTS subjects jsonb DEFAULT '[]'::jsonb;
