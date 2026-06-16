ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS institution_type text NOT NULL DEFAULT '';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS institution_category text NOT NULL DEFAULT '';
ALTER TABLE public.npos ADD COLUMN IF NOT EXISTS institution_type text NOT NULL DEFAULT '';
ALTER TABLE public.npos ADD COLUMN IF NOT EXISTS institution_category text NOT NULL DEFAULT '';
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS institution_type text NOT NULL DEFAULT '';
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS institution_category text NOT NULL DEFAULT '';
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS institution_type text NOT NULL DEFAULT '';
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS institution_category text NOT NULL DEFAULT '';