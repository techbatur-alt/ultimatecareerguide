
-- 1) Restrict public SELECT on sensitive CRM tables to staff
DROP POLICY IF EXISTS "Anyone can view npos" ON public.npos;
CREATE POLICY "Staff can view npos" ON public.npos
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));

DROP POLICY IF EXISTS "Anyone can view pbos" ON public.pbos;
CREATE POLICY "Staff can view pbos" ON public.pbos
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));

DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
CREATE POLICY "Staff can view schools" ON public.schools
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));

DROP POLICY IF EXISTS "Anyone can view sponsors" ON public.sponsors;
CREATE POLICY "Staff can view sponsors" ON public.sponsors
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));

DROP POLICY IF EXISTS "Anyone can view trainers" ON public.trainers;
CREATE POLICY "Staff can view trainers" ON public.trainers
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));

-- 2) Prevent profile role self-escalation
CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NULL OR NOT public.has_any_role(auth.uid(), ARRAY['support','executive']) THEN
      RAISE EXCEPTION 'Not authorized to change role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_self_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_self_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_self_change();

-- 3) Storage policies for previously unprotected buckets (staff-only)
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['header-content','testimonials','trade-references','home-page-content']
  LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS %I ON storage.objects;
      CREATE POLICY %I ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = %L AND public.has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
    $f$, 'Staff can read '||b, 'Staff can read '||b, b);
    EXECUTE format($f$
      DROP POLICY IF EXISTS %I ON storage.objects;
      CREATE POLICY %I ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = %L AND public.has_any_role(auth.uid(), ARRAY['support','executive']));
    $f$, 'Staff can upload '||b, 'Staff can upload '||b, b);
    EXECUTE format($f$
      DROP POLICY IF EXISTS %I ON storage.objects;
      CREATE POLICY %I ON storage.objects
        FOR UPDATE TO authenticated
        USING (bucket_id = %L AND public.has_any_role(auth.uid(), ARRAY['support','executive']))
        WITH CHECK (bucket_id = %L AND public.has_any_role(auth.uid(), ARRAY['support','executive']));
    $f$, 'Staff can update '||b, 'Staff can update '||b, b, b);
    EXECUTE format($f$
      DROP POLICY IF EXISTS %I ON storage.objects;
      CREATE POLICY %I ON storage.objects
        FOR DELETE TO authenticated
        USING (bucket_id = %L AND public.has_any_role(auth.uid(), ARRAY['support','executive']));
    $f$, 'Staff can delete '||b, 'Staff can delete '||b, b);
  END LOOP;
END$$;

-- 4) Tighten evolumes upload to staff only
DROP POLICY IF EXISTS "Admin can upload volumes" ON storage.objects;
CREATE POLICY "Staff can upload volumes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evolumes' AND public.has_any_role(auth.uid(), ARRAY['support','executive']));

-- 5) Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_create_order_ticket() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_profile_role_self_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, text[]) TO authenticated;
