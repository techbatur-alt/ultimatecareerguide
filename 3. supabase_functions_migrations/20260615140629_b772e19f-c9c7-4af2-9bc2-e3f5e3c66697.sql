DELETE FROM public.schools s USING public.schools s2 WHERE s.ctid < s2.ctid AND s.emis_number = s2.emis_number AND s.name = s2.name AND s.emis_number <> '';
-- Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS schools_emis_unique ON public.schools (emis_number) WHERE emis_number <> '';