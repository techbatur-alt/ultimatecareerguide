
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salutation TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  nickname TEXT NOT NULL DEFAULT '',
  id_number TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  email TEXT NOT NULL DEFAULT '',
  mobile_1 TEXT NOT NULL DEFAULT '',
  mobile_2 TEXT DEFAULT '',
  telephone_home TEXT DEFAULT '',
  telephone_work TEXT DEFAULT '',
  home_address TEXT NOT NULL DEFAULT '',
  work_address TEXT DEFAULT '',
  profile_picture_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'account_holder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-profiles (students/learners under account holder)
CREATE TABLE public.sub_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_holder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  nickname TEXT DEFAULT '',
  email TEXT DEFAULT '',
  mobile_1 TEXT DEFAULT '',
  mobile_2 TEXT DEFAULT '',
  telephone_home TEXT DEFAULT '',
  telephone_work TEXT DEFAULT '',
  home_address TEXT DEFAULT '',
  work_address TEXT DEFAULT '',
  profile_type TEXT NOT NULL DEFAULT 'student',
  profile_picture_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL DEFAULT '',
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_method TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device sessions
CREATE TABLE public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL DEFAULT '',
  user_agent TEXT DEFAULT '',
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own sub_profiles" ON public.sub_profiles FOR SELECT USING (auth.uid() = account_holder_id);
CREATE POLICY "Users can insert own sub_profiles" ON public.sub_profiles FOR INSERT WITH CHECK (auth.uid() = account_holder_id);
CREATE POLICY "Users can update own sub_profiles" ON public.sub_profiles FOR UPDATE USING (auth.uid() = account_holder_id);
CREATE POLICY "Users can delete own sub_profiles" ON public.sub_profiles FOR DELETE USING (auth.uid() = account_holder_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own device_sessions" ON public.device_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own device_sessions" ON public.device_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own device_sessions" ON public.device_sessions FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
