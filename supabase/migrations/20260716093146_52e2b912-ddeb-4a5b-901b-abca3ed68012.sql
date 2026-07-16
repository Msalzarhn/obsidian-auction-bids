-- Reset admin password and ensure email confirmed
UPDATE auth.users
SET encrypted_password = crypt('08594499', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'mauricio.shn@gmail.com';

-- Make sure admin role is granted
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'mauricio.shn@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;