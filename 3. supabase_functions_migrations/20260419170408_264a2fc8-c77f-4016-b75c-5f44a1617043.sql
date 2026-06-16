-- Set temp password for the executive admin
UPDATE auth.users
SET 
  encrypted_password = crypt('mR23#212561312', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'info.donasmatesyouth@gmail.com';