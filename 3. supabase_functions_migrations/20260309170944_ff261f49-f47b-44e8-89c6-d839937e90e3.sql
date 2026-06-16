
-- 1. Create security definer function to check roles (avoids RLS recursion on profiles table)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- 2. Helper function to check if user has one of allowed roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = ANY(_roles)
  )
$$;

-- 3. Update default role value
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'subscriber';

-- 4. Migrate existing account_holder and admin roles
UPDATE public.profiles SET role = 'subscriber' WHERE role = 'account_holder';
UPDATE public.profiles SET role = 'executive' WHERE role = 'admin';

-- 5. Add CHECK constraint for valid roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('subscriber', 'stakeholder', 'service', 'support', 'sales_agent', 'executive'));

-- 6. Add is_active column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 7. Drop old RLS policies on sponsors that reference profiles.role = 'admin'
DROP POLICY IF EXISTS "Admins can delete sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admins can insert sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admins can update sponsors" ON public.sponsors;

-- 8. Recreate sponsors policies using security definer function
CREATE POLICY "Staff can delete sponsors" ON public.sponsors
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support', 'sales_agent', 'executive']));

CREATE POLICY "Staff can insert sponsors" ON public.sponsors
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['support', 'sales_agent', 'executive']));

CREATE POLICY "Staff can update sponsors" ON public.sponsors
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support', 'sales_agent', 'executive']));

-- 9. Drop old RLS policies on sponsorship_allocations
DROP POLICY IF EXISTS "Admins can delete allocations" ON public.sponsorship_allocations;
DROP POLICY IF EXISTS "Admins can insert allocations" ON public.sponsorship_allocations;
DROP POLICY IF EXISTS "Admins can update allocations" ON public.sponsorship_allocations;

-- 10. Recreate allocations policies
CREATE POLICY "Staff can delete allocations" ON public.sponsorship_allocations
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support', 'sales_agent', 'executive']));

CREATE POLICY "Staff can insert allocations" ON public.sponsorship_allocations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['support', 'sales_agent', 'executive']));

CREATE POLICY "Staff can update allocations" ON public.sponsorship_allocations
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support', 'sales_agent', 'executive']));

-- 11. Update handle_new_user to use 'subscriber' default (already handled by column default, but be explicit)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, salutation, first_name, last_name, nickname, id_number, mobile_1, mobile_2, telephone_home, telephone_work, home_address, work_address, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'salutation', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
    COALESCE(NEW.raw_user_meta_data->>'id_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_1', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_2', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone_home', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone_work', ''),
    COALESCE(NEW.raw_user_meta_data->>'home_address', ''),
    COALESCE(NEW.raw_user_meta_data->>'work_address', ''),
    CASE WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE ELSE NULL END
  );
  RETURN NEW;
END;
$function$;
