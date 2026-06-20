-- Fix new-user profile creation so auth signups and admin user creation succeed.
-- The previous trigger inserted into public.profiles without bypassing RLS, which caused
-- auth provisioning requests to fail with a generic database error.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  SET LOCAL row_security = off;

  INSERT INTO public.profiles (
    id,
    email,
    salutation,
    first_name,
    last_name,
    nickname,
    id_number,
    mobile_1,
    mobile_2,
    telephone_home,
    telephone_work,
    home_address,
    work_address,
    date_of_birth,
    role
  )
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
    CASE WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'role', 'subscriber')
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
