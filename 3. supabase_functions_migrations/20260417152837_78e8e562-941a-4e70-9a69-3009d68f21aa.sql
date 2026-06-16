-- Wipe in dependency order
DELETE FROM public.device_sessions;
DELETE FROM public.subscriptions;
DELETE FROM public.sub_profiles;
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- Create new admin (trigger handle_new_user will auto-create the profile row)
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'info.donasmatesyouth@gmail.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Admin","last_name":"Donasmates","salutation":"Mr","nickname":"Admin"}'::jsonb,
    false, ''
  );

  -- Promote the auto-created profile to executive
  UPDATE public.profiles
  SET role = 'executive', is_active = true
  WHERE id = new_user_id;
END $$;