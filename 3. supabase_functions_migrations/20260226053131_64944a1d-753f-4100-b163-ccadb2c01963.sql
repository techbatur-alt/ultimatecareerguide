
-- Fix search_path on the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
